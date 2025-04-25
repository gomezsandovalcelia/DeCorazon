// controllers/respuesta.controller.js
const { response } = require("express");
const Respuesta = require("../models/respuesta");
const Paciente = require("../models/paciente");
const Pregunta = require("../models/pregunta");

// Obtener todas las respuestas
const obtenerRespuestas = async (req, res = response) => {
    try {
        const respuestas = await Respuesta.find();
        
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
        // Obtener las respuestas del paciente
        const respuestas = await Respuesta.find({ patientId: pacienteId })
            .sort({ date: -1 });
        
        // Obtener los IDs cortos de las preguntas
        const questionShortIds = [...new Set(respuestas.map(r => r.questionId))];
        
        // Buscar todas las preguntas por shortId en lugar de _id
        const preguntas = await Pregunta.find({ 
            shortId: { $in: questionShortIds } 
        });
        
        // Crear un mapa para acceder rápidamente a las preguntas por shortId
        const preguntasMap = {};
        preguntas.forEach(pregunta => {
            preguntasMap[pregunta.shortId] = pregunta;
        });
        
        // Enriquecer las respuestas con información de las preguntas
        const respuestasCompletas = respuestas.map(respuesta => {
            const pregunta = preguntasMap[respuesta.questionId] || {};
            return {
                ...respuesta.toObject(),
                questionText: pregunta.question || 'Pregunta no disponible'
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
            msg: 'Error del servidor al obtener respuestas'
        });
    }
};

// Obtener respuestas con alertas para el panel del médico
const getAlertasPacientes = async (req, res = response) => {
    try {
        // Obtener respuestas con alerta, ordenadas por fecha descendente
        const alertas = await Respuesta.find({ alerta: true })
            .sort({ date: -1 })
            .limit(50); // Limitar a las 50 más recientes
        
        // Obtener información de las preguntas para cada respuesta
        const questionIds = [...new Set(alertas.map(alerta => alerta.questionId))];
        const preguntas = await Pregunta.find({ _id: { $in: questionIds } });
        
        // Crear mapa de preguntas para acceso rápido
        const preguntaMap = {};
        preguntas.forEach(pregunta => {
            preguntaMap[pregunta._id] = pregunta;
        });
        
        // Obtener la información básica de cada paciente para mostrarla
        const pacientesIds = [...new Set(alertas.map(alerta => alerta.patientId))];
        const pacientes = await Paciente.find({ _id: { $in: pacientesIds } })
            .select('nombre apellidos'); // Seleccionar solo los campos necesarios
        
        // Crear un mapa de pacientes para acceso rápido
        const pacienteMap = {};
        pacientes.forEach(paciente => {
            pacienteMap[paciente._id] = paciente;
        });
        
        // Agregar la información completa a cada alerta
        const alertasCompletas = alertas.map(alerta => {
            const pregunta = preguntaMap[alerta.questionId] || { question: 'Pregunta no disponible' };
            const paciente = pacienteMap[alerta.patientId] || { nombre: 'Desconocido', apellidos: '' };
            
            return {
                _id: alerta._id,
                patientId: alerta.patientId,
                questionId: alerta.questionId,
                answer: alerta.answer,
                date: alerta.date,
                alerta: alerta.alerta,
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
            msg: "Error interno del servidor"
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
        
        respuesta.alerta = alerta;
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
            msg: 'Error del servidor al actualizar estado de alerta'
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
        const fechaAyer = ayer.toISOString().split('T')[0];
        const fechaHoy = hoy.toISOString().split('T')[0];
        
        // Buscar respuestas con alerta del último día
        const respuestasConAlerta = await Respuesta.find({
            patientId: pacienteId,
            alerta: true,
            date: { $gte: fechaAyer } // Respuestas desde ayer
        }).limit(1); // Solo necesitamos una para confirmar que hay alertas
        
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
            msg: "Error interno del servidor"
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