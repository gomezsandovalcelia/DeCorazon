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

module.exports = { obtenerPacientes, crearPaciente, actualizarPaciente, borrarPaciente }
