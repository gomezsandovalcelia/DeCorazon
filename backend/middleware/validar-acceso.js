// middleware/validar-acceso.js
// Deben ejecutarse después de validarJWT, que rellena req.uid y req.rol
const { response } = require('express');
const Medico = require('../models/medico');

// Comprueba si el médico tiene al paciente en su lista de pacientes
const medicoTienePaciente = async (medicoId, pacienteId) => {
    try {
        return !!(await Medico.exists({ _id: medicoId, pacientes: pacienteId }));
    } catch (error) {
        // Un id con formato no válido no puede pertenecer al médico
        return false;
    }
};

// Permite el acceso al propio paciente o a un médico que lo tenga asignado.
// obtenerId indica de dónde se lee el id del paciente (por defecto, req.params.id)
const validarAccesoPaciente = (obtenerId = (req) => req.params.id) => {
    return async (req, res = response, next) => {
        const pacienteId = String(obtenerId(req) || '');

        if (req.rol === 'PACIENTE' && req.uid === pacienteId) {
            return next();
        }

        if (req.rol === 'MEDICO' && await medicoTienePaciente(req.uid, pacienteId)) {
            return next();
        }

        return res.status(403).json({
            ok: false,
            msg: 'No tiene acceso a los datos de este paciente'
        });
    };
};

// Permite el acceso solo si el id de la ruta es el del propio usuario
const validarMismoUsuario = (req, res = response, next) => {
    if (req.uid !== req.params.id) {
        return res.status(403).json({
            ok: false,
            msg: 'No tiene acceso a los datos de este usuario'
        });
    }
    next();
};

module.exports = {
    medicoTienePaciente,
    validarAccesoPaciente,
    validarMismoUsuario
};
