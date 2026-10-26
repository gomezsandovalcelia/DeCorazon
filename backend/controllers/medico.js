// controllers/medico.js
const { response } = require("express");
const Medico = require('../models/medico');
const bcrypt = require('bcryptjs');

const obtenerMedicos = async (req, res) => {
    const medicos = await Medico.find({});
    
    res.json({
        ok: true,
        msg: 'getMedicos',
        medicos
    });
}

const crearMedico = async (req, res) => {
    // Solo se aceptan estos campos; el rol siempre es MEDICO
    const { nombre, apellidos, email, password } = req.body;

    try {
        const existeEmail = await Medico.findOne({ email: email });

        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'Email de médico ya existe'
            });
        }

        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(password, salt);

        const medico = new Medico({ nombre, apellidos, email, password: cpassword });
        await medico.save();

        res.json({
            ok: true,
            msg: 'crearMedico',
            medico
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok: false,
            msg: 'Error creando médico'
        });
    }
}
const obtenerPacientesAsignados = async (req, res) => {
    try {
        const medicoId = req.params.id;
        const medico = await Medico.findById(medicoId).populate('pacientes'); // Obtén todos los datos del paciente

        if (!medico) {
            return res.status(404).json({ 
                ok: false, 
                message: 'Médico no encontrado' 
            });
        }

        res.json({
            ok: true,
            pacientes: medico.pacientes // Incluye todos los datos del paciente
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error del servidor'
        });
    }
};
const obtenerMedicoPorId = async (req, res) => {
    try {
        const medicoId = req.params.id;
        const medico = await Medico.findById(medicoId);

        if (!medico) {
            return res.status(404).json({
                ok: false,
                message: 'Médico no encontrado',
            });
        }

        res.json({
            ok: true,
            medico,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error del servidor',
        });
    }
};
module.exports = {
    obtenerMedicos,
    crearMedico,
    obtenerPacientesAsignados, 
    obtenerMedicoPorId
}