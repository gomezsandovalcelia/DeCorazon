const Paciente = require('../models/paciente');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');


const obtenerPacientes = async (req, res) => {

    const pacientes = await Paciente.find({});

    res.json({
        ok: true,
        msg: 'getpaciente',
        pacientes
    });
}

const crearPaciente = async (req, res) => {
   

    const { email, password, rol } = req.body;

    try {
        const exiteEmail = await Paciente.findOne({ email: email });

        if (exiteEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'Email paciente ya existe'
            });
        }

        if(rol && rol != 'PACIENTE'){
            return res.status(400).json({
                ok: false,
                msg: 'Rol no permitido'
            });
        }

        const salt = bcrypt.genSaltSync();
       
        const cpassword = bcrypt.hashSync(password, salt); // y aqui ciframos la contraseña 

        const paciente = new Paciente(req.body);
        paciente.password = cpassword;
        await paciente.save();

        res.json({
            ok: true,
            msg: 'crearpaciente',
            paciente
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok: false,
            msg: 'Error creando usuario'
        });
    }

  
}

const actualizarPaciente = async(req, res = response) => {

    const { password, email, ...object } = req.body;
    const uid = req.params.id;

    try{
        const existeEmail = await Paciente.findOne({ email: email });

        if(existeEmail){
            if(existeEmail._id != uid){
                const valor = existeEmail._id;

                return res.status(400).json({
                    ok: false,
                    msg: 'Email ya existe',
                });
            }
        }

        object.email = email;
        const paciente = await Paciente.findByIdAndUpdate(uid, object, { new: true });

        res.json({
            ok: true,
            msg: 'paciente actualizado',
            paciente
        });

    } catch (error) {
        //console.log(error);
        res.status(400).json({
            ok: false,
            msg: 'Error actualizando paciente'
        });
    }

    /*res.json({
        ok: true,
        msg: 'actualizarUsuario'
    });*/
}

const borrarPaciente = async(req, res = response) => {
    
    const uid = req.params.id;

    try {
        const existePaciente = await Paciente.findById(uid);
        if(!existePaciente){
            return res.status(400).json({
                ok: true,
                msg: 'Paciente no existe'
            });
        }
        const resultado = await Paciente.findByIdAndDelete(uid);

        res.json({
            ok: true,
            msg: 'Paciente eliminado',
            resultado
        });
    } catch (error) {
        //console.log(error);
        res.status(400).json({
            ok: false,
            msg: 'Error borrando Paciente'
        });
    }
    /*res.json({
        ok: true,
        msg: 'borrarUsuario'
    });*/
}

const obtenerTratamientos = async (req, res) => {
    try {
        const patientId = req.params.id;
        const paciente = await Paciente.findById(patientId).select('treatments'); // Selecciona solo 'treatments'

        if (!paciente) {
            return res.status(404).json({ 
                ok: false, 
                message: 'Paciente no encontrado' 
            });
        }
        //console.log('Ejercicios del paciente:', paciente.treatments);
        res.json({
            ok: true,
            treatments: paciente.treatments // Envía el array de tratamientos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error del servidor'
        });
    }
};

const obtenerEjercicios = async (req, res) => {
    try {
        const patientId = req.params.id;
        const paciente = await Paciente.findById(patientId).select('exercise_routines');

        if (!paciente) {
            return res.status(404).json({ 
                ok: false, 
                message: 'Paciente no encontrado' 
            });
        }

        //console.log('Ejercicios del paciente:', paciente.exercise_routines);

        res.json({
            ok: true,
            exercise_routines: paciente.exercise_routines 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error del servidor'
        });
    }
};

const actualizarCheckpoint = async (req, res) => {
    const patientId = req.params.id;
    const exerciseId = req.params.exerciseId;
    //console.log('patientId:', patientId);
    //console.log('exerciseId:', exerciseId);
    const { checkpoint } = req.body; 

    try {
        const paciente = await Paciente.findById(patientId);

        if (!paciente) {
            return res.status(404).json({
                ok: false,
                message: 'Paciente no encontrado'
            });
        }
        const exerciseIndex = paciente.exercise_routines.findIndex(ex => ex._id.toString() === exerciseId);

        if (exerciseIndex === -1) {
            return res.status(404).json({
                ok: false,
                message: 'Ejercicio no encontrado'
            });
        }
       
        paciente.exercise_routines[exerciseIndex].checkpoint = checkpoint;

        await paciente.save();

        res.json({
            ok: true,
            message: 'Checkpoint actualizado',
            updatedExercise: paciente.exercise_routines[exerciseIndex]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error actualizando el checkpoint'
        });
    }
};

const obtenerPacientePorId = async (req, res) => {
    try {
        const patientId = req.params.id;
        const paciente = await Paciente.findById(patientId); // Selecciona solo 'treatments'

        if (!paciente) {
            return res.status(404).json({ 
                ok: false, 
                message: 'Paciente no encontrado' 
            });
        }
        //console.log('Ejercicios del paciente:', paciente.treatments);
        res.json({
            ok: true,
            paciente // Envía el array de tratamientos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error del servidor'
        });
    }
};

const obtenerMedidas = async (req, res) => {
    try {
        const patientId = req.params.id;
        const paciente = await Paciente.findById(patientId).select('measurements');

        if (!paciente) {
            return res.status(404).json({ 
                ok: false, 
                message: 'Paciente no encontrado' 
            });
        }

        //console.log('Ejercicios del paciente:', paciente.exercise_routines);

        res.json({
            ok: true,
            measurements: paciente.measurements 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error del servidor'
        });
    }
};

const cambiarMedidas = async (req, res) => {
    const patientId = req.params.id;
    const { weight, heart_rate, blood_pressure } = req.body; 

    try {
        const paciente = await Paciente.findById(patientId);
        if (!paciente) {
            return res.status(404).json({
                ok: false,
                message: 'Paciente no encontrado'
            });
        }
        const newMeasurement = {
            date: new Date().toISOString().split('T')[0], // Formato 'YYYY-MM-DD'
            weight,
            heart_rate,
            blood_pressure
        };

        paciente.measurements.push(newMeasurement);

        await paciente.save();

        return res.status(200).json({
            ok: true,
            message: 'Medidas actualizadas exitosamente',
            measurements: paciente.measurements
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Error del servidor'
        });
    }
};

module.exports = { obtenerPacientes, crearPaciente, 
    actualizarPaciente, borrarPaciente, obtenerTratamientos, 
    obtenerEjercicios, actualizarCheckpoint, obtenerPacientePorId, 
    obtenerMedidas, cambiarMedidas }
