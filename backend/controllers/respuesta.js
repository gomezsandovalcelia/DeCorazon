// controllers/respuesta.js
const { response } = require("express");
const Respuesta = require("../models/respuesta");
const Paciente = require("../models/paciente");
const Pregunta = require("../models/pregunta");
const Medico = require("../models/medico");
const { medicoTienePaciente } = require("../middleware/validar-acceso");

// Ids de los pacientes asignados al médico que hace la petición
const obtenerPacientesDelMedico = async (medicoId) => {
    const medico = await Medico.findById(medicoId).select('pacientes');
    return medico ? medico.pacientes : [];
};

// Obtener todas las respuestas de los pacientes del médico
const obtenerRespuestas = async (req, res = response) => {
    try {
        const pacientes = await obtenerPacientesDelMedico(req.uid);
        const respuestas = await Respuesta.find({ pacienteId: { $in: pacientes } });
        
        res.json({
            ok: true,
            respuestas
        });
    } catch (error) {
        console.error('Error obteniendo respuestas:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor al obtener respuestas'
        });
    }
};

const obtenerRespuestasPaciente = async (req, res = response) => {
    const { pacienteId } = req.params;
    
    try {
        // Obtener las respuestas del paciente (usando pacienteId en lugar de patientId)
        const respuestas = await Respuesta.find({ pacienteId: pacienteId })
            .sort({ date: -1 });
        
        console.log(`Encontradas ${respuestas.length} respuestas para el paciente ${pacienteId}`);
        
        if (respuestas.length === 0) {
            return res.json({
                ok: true,
                respuestas: []
            });
        }
        
        // Obtener los IDs de las preguntas
        const questionIds = [...new Set(respuestas.map(r => r.questionId))];
        
        // Buscar todas las preguntas
        const preguntas = await Pregunta.find({ 
            _id: { $in: questionIds } 
        });
        
        console.log(`Encontradas ${preguntas.length} preguntas relacionadas`);
        
        // Crear un mapa para acceder rápidamente a las preguntas por ID
        const preguntasMap = {};
        preguntas.forEach(pregunta => {
            preguntasMap[pregunta._id.toString()] = pregunta;
        });
        
        // Enriquecer las respuestas con información de las preguntas
        const respuestasCompletas = respuestas.map(respuesta => {
            const questionIdStr = respuesta.questionId.toString();
            const pregunta = preguntasMap[questionIdStr] || {};
            
            return {
                ...respuesta.toObject(),
                questionText: pregunta.question || 'Pregunta no disponible',
                // Usar triggeredAlert como fuente de alerta
                alerta: respuesta.triggeredAlert
            };
        });
        
        res.json({
            ok: true,
            respuestas: respuestasCompletas
        });
    } catch (error) {
        console.error('Error obteniendo respuestas del paciente:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor al obtener respuestas',
        });
    }
};

// Obtener respuestas con alertas para el panel del médico
const getAlertasPacientes = async (req, res = response) => {
    try {
        // Obtener respuestas con alerta, usando triggeredAlert en lugar de alerta
        const pacientesMedico = await obtenerPacientesDelMedico(req.uid);
        const alertas = await Respuesta.find({ triggeredAlert: true, pacienteId: { $in: pacientesMedico } })
            .sort({ date: -1 })
            .limit(50); // Limitar a las 50 más recientes
        
        console.log(`Encontradas ${alertas.length} alertas activas`);
        
        if (alertas.length === 0) {
            return res.json({
                ok: true,
                alertas: []
            });
        }
        
        // Obtener información de las preguntas para cada respuesta
        const questionIds = [...new Set(alertas.map(alerta => alerta.questionId))];
        const preguntas = await Pregunta.find({ _id: { $in: questionIds } });
        
        // Crear mapa de preguntas para acceso rápido
        const preguntaMap = {};
        preguntas.forEach(pregunta => {
            preguntaMap[pregunta._id.toString()] = pregunta;
        });
        
        // Obtener la información básica de cada paciente para mostrarla
        const pacientesIds = [...new Set(alertas.map(alerta => alerta.pacienteId))];
        const pacientes = await Paciente.find({ _id: { $in: pacientesIds } })
            .select('nombre apellidos'); // Seleccionar solo los campos necesarios
        
        // Crear un mapa de pacientes para acceso rápido
        const pacienteMap = {};
        pacientes.forEach(paciente => {
            pacienteMap[paciente._id.toString()] = paciente;
        });
        
        // Agregar la información completa a cada alerta
        const alertasCompletas = alertas.map(alerta => {
            const questionIdStr = alerta.questionId.toString();
            const pacienteIdStr = alerta.pacienteId.toString();
            
            const pregunta = preguntaMap[questionIdStr] || { question: 'Pregunta no disponible' };
            const paciente = pacienteMap[pacienteIdStr] || { nombre: 'Desconocido', apellidos: '' };
            
            return {
                _id: alerta._id,
                pacienteId: alerta.pacienteId, // Usar nombre consistente
                questionId: alerta.questionId,
                answer: alerta.answer,
                date: alerta.date,
                alerta: alerta.triggeredAlert, // Mapear triggeredAlert a alerta para compatibilidad
                questionText: pregunta.question,
                pacienteNombre: paciente.nombre,
                pacienteApellidos: paciente.apellidos
            };
        });
        
        return res.json({
            ok: true,
            alertas: alertasCompletas
        });
    } catch (error) {
        console.error("Error obteniendo alertas:", error);
        return res.status(500).json({
            ok: false,
            msg: "Error interno del servidor",
        });
    }
};

// Agregar o actualizar el estado de alerta de una respuesta
const actualizarAlertaRespuesta = async (req, res = response) => {
    const { id } = req.params;
    const { alerta } = req.body;
    
    try {
        const respuesta = await Respuesta.findById(id);
        
        if (!respuesta) {
            return res.status(404).json({
                ok: false,
                msg: 'Respuesta no encontrada'
            });
        }

        if (!await medicoTienePaciente(req.uid, respuesta.pacienteId)) {
            return res.status(403).json({
                ok: false,
                msg: 'No tiene acceso a los datos de este paciente'
            });
        }

        // Actualizar triggeredAlert en lugar de alerta
        respuesta.triggeredAlert = alerta;
        await respuesta.save();
        
        res.json({
            ok: true,
            msg: 'Estado de alerta actualizado correctamente',
            respuesta
        });
    } catch (error) {
        console.error('Error actualizando estado de alerta:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor al actualizar estado de alerta',
        });
    }
};

const verificarAlertasPaciente = async (req, res = response) => {
    const { pacienteId } = req.params;
    
    try {
        // Obtener la fecha de ayer
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        
        console.log(`Verificando alertas para paciente ${pacienteId} desde ${ayer.toISOString()}`);
        
        // Buscar respuestas con alerta del último día (usando triggeredAlert en lugar de alerta)
        const respuestasConAlerta = await Respuesta.find({
            pacienteId: pacienteId, // Usar pacienteId en lugar de patientId
            triggeredAlert: true,
            date: { $gte: ayer } // Respuestas desde ayer
        }).limit(1); // Solo necesitamos una para confirmar que hay alertas
        
        console.log(`Encontradas ${respuestasConAlerta.length} respuestas con alerta`);
        
        const tieneAlertas = respuestasConAlerta.length > 0;
        
        return res.json({
            ok: true,
            tieneAlertas,
            // Opcional: devolver la primera alerta encontrada
            alerta: tieneAlertas ? respuestasConAlerta[0] : null
        });
    } catch (error) {
        console.error("Error verificando alertas del paciente:", error);
        return res.status(500).json({
            ok: false,
            msg: "Error interno del servidor",
        });
    }
};

module.exports = {
    obtenerRespuestas,
    obtenerRespuestasPaciente,
    getAlertasPacientes,
    actualizarAlertaRespuesta,
    verificarAlertasPaciente
};