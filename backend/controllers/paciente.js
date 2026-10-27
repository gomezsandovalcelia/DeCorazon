const Paciente = require('../models/paciente');
const Medico = require('../models/medico');
const bcrypt = require('bcryptjs');
const { response } = require("express");

// Pastillero con los 7 días de la semana sin medicación
const pastilleroVacio = () => {
    const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    return diasSemana.map(day => ({ day, morning: '', afternoon: '', night: '' }));
};

const obtenerPacientes = async (req, res) => {

    const pacientes = await Paciente.find({});

    res.json({
        ok: true,
        msg: 'getpaciente',
        pacientes
    });
}

const crearPaciente = async (req, res) => {
   

    // Solo se aceptan estos campos; el rol siempre es PACIENTE
    const { nombre, apellidos, email, password, altura } = req.body;

    try {
        const exiteEmail = await Paciente.findOne({ email: email });

        if (exiteEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'Email paciente ya existe'
            });
        }

        const salt = bcrypt.genSaltSync();

        const cpassword = bcrypt.hashSync(password, salt); // y aqui ciframos la contraseña

        const paciente = new Paciente({ nombre, apellidos, email, altura, password: cpassword });
        await paciente.save();

        // El médico que da de alta al paciente lo tiene asignado
        await Medico.findByIdAndUpdate(req.uid, { $addToSet: { pacientes: paciente._id } });

        res.json({
            ok: true,
            msg: 'crearpaciente',
            paciente
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            ok: false,
            msg: 'Error creando usuario'
        });
    }

  
}

const actualizarPaciente = async(req, res = response) => {

    // Solo se pueden modificar estos campos (nunca rol, password ni el médico asignado)
    const { nombre, apellidos, email, altura } = req.body;
    const object = { nombre, apellidos, altura };
    const uid = req.params.id;

    try{
        const existeEmail = await Paciente.findOne({ email: email });

        if(existeEmail){
            if(existeEmail._id != uid){
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
        //console.error(error);
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
            return res.status(404).json({
                ok: false,
                msg: 'Paciente no existe'
            });
        }
        const resultado = await Paciente.findByIdAndDelete(uid);
        // Quitarlo también de la lista de pacientes de los médicos
        await Medico.updateMany({ pacientes: uid }, { $pull: { pacientes: uid } });

        res.json({
            ok: true,
            msg: 'Paciente eliminado',
            resultado
        });
    } catch (error) {
        //console.error(error);
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
                msg: 'Paciente no encontrado' 
            });
        }
        res.json({
            ok: true,
            treatments: paciente.treatments // Envía el array de tratamientos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
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
                msg: 'Paciente no encontrado' 
            });
        }


        res.json({
            ok: true,
            exercise_routines: paciente.exercise_routines 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};

const actualizarCheckpoint = async (req, res) => {
    const patientId = req.params.id;
    const exerciseId = req.params.exerciseId;
    const { checkpoint } = req.body; 

    try {
        const paciente = await Paciente.findById(patientId);

        if (!paciente) {
            return res.status(404).json({
                ok: false,
                msg: 'Paciente no encontrado'
            });
        }
        const exerciseIndex = paciente.exercise_routines.findIndex(ex => ex._id.toString() === exerciseId);

        if (exerciseIndex === -1) {
            return res.status(404).json({
                ok: false,
                msg: 'Ejercicio no encontrado'
            });
        }
       
        paciente.exercise_routines[exerciseIndex].checkpoint = checkpoint;

        await paciente.save();

        res.json({
            ok: true,
            msg: 'Checkpoint actualizado',
            updatedExercise: paciente.exercise_routines[exerciseIndex]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error actualizando el checkpoint'
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
                msg: 'Paciente no encontrado' 
            });
        }
        res.json({
            ok: true,
            paciente // Envía el array de tratamientos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
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
                msg: 'Paciente no encontrado' 
            });
        }


        res.json({
            ok: true,
            measurements: paciente.measurements 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
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
                msg: 'Paciente no encontrado'
            });
        }
        const newMeasurement = {
            date: new Date(),
            weight,
            heart_rate,
            blood_pressure
        };

        paciente.measurements.push(newMeasurement);

        await paciente.save();

        return res.status(200).json({
            ok: true,
            msg: 'Medidas actualizadas exitosamente',
            measurements: paciente.measurements
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};

//nuevo para medico 

// Agregar tratamiento a un paciente
const agregarTratamiento = async (req, res) => {
    try {
        const pacienteId = req.params.id;
        const { description, date } = req.body;

        // Validar los campos requeridos
        if (!description || !date) {
            return res.status(400).json({
                ok: false,
                msg: 'La descripción y la fecha son campos requeridos',
            });
        }

        // Buscar el paciente
        const paciente = await Paciente.findById(pacienteId);
        if (!paciente) {
            return res.status(404).json({
                ok: false,
                msg: 'Paciente no encontrado',
            });
        }

        // Agregar el nuevo tratamiento
        paciente.treatments.push({
            date,
            description
        });

        // Guardar el paciente actualizado
        await paciente.save();

        res.json({
            ok: true,
            msg: 'Tratamiento agregado correctamente',
            paciente
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
        });
    }
};

// Agregar ejercicio a un paciente
const agregarEjercicio = async (req, res) => {
    try {
        const pacienteId = req.params.id;
        const { description, date, checkpoint } = req.body;

        // Validar los campos requeridos
        if (!description || !date) {
            return res.status(400).json({
                ok: false,
                msg: 'La descripción y la fecha son campos requeridos',
            });
        }

        // Buscar el paciente
        const paciente = await Paciente.findById(pacienteId);
        if (!paciente) {
            return res.status(404).json({
                ok: false,
                msg: 'Paciente no encontrado',
            });
        }

        // Generar un ID único para el ejercicio (puedes usar alguna librería como uuid)
        const ejercicioId = Date.now().toString();

        // Agregar el nuevo ejercicio
        paciente.exercise_routines.push({
            _id: ejercicioId,
            date,
            description,
            checkpoint: checkpoint || false
        });

        // Guardar el paciente actualizado
        await paciente.save();

        res.json({
            ok: true,
            msg: 'Ejercicio agregado correctamente',
            paciente
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
        });
    }
};
const obtenerPastillero = async (req, res) => {
    try {
        const patientId = req.params.id;
        const paciente = await Paciente.findById(patientId).select('pastillero');

        if (!paciente) {
            return res.status(404).json({ 
                ok: false, 
                msg: 'Paciente no encontrado' 
            });
        }

        // Si el paciente no tiene pastillero, lo inicializamos
        if (!paciente.pastillero || paciente.pastillero.length === 0) {
            // Inicializamos el pastillero con los días de la semana
            paciente.pastillero = pastilleroVacio();
            await paciente.save();
        }

        res.json({
            ok: true,
            pastillero: paciente.pastillero
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};

// Actualizar la medicación de un día específico
const actualizarMedicacionDia = async (req, res) => {
    try {
        const patientId = req.params.id;
        const { day } = req.params;
        const { morning, afternoon, night } = req.body;

        const paciente = await Paciente.findById(patientId);

        if (!paciente) {
            return res.status(404).json({
                ok: false,
                msg: 'Paciente no encontrado'
            });
        }

        // Inicializar pastillero si no existe
        if (!paciente.pastillero || paciente.pastillero.length === 0) {
            paciente.pastillero = pastilleroVacio();
        }

        // Encontrar el día en el pastillero y actualizarlo
        const dayIndex = paciente.pastillero.findIndex(d => d.day.toLowerCase() === day.toLowerCase());
        
        if (dayIndex === -1) {
            return res.status(404).json({
                ok: false,
                msg: 'Día no encontrado'
            });
        }

        // Actualizar los campos proporcionados
        if (morning !== undefined) paciente.pastillero[dayIndex].morning = morning;
        if (afternoon !== undefined) paciente.pastillero[dayIndex].afternoon = afternoon;
        if (night !== undefined) paciente.pastillero[dayIndex].night = night;

        await paciente.save();

        res.json({
            ok: true,
            msg: 'Medicación actualizada correctamente',
            day: paciente.pastillero[dayIndex]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};

module.exports = { obtenerPacientes, crearPaciente, 
    actualizarPaciente, borrarPaciente, obtenerTratamientos, 
    obtenerEjercicios, actualizarCheckpoint, obtenerPacientePorId, 
    obtenerMedidas, cambiarMedidas,
    agregarTratamiento, agregarEjercicio, obtenerPastillero,
    actualizarMedicacionDia};
