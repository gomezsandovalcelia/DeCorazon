const Usuario = require('../models/usuarios');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const obtenerUsuarios = async (req, res) => {

    const usuarios = await Usuario.find({});

    res.json({
        ok: true,
        msg: 'getusuarios',
        usuarios
    });
}

const crearUsuario = async (req, res) => {
    //const erroresVal = validationResult(req);

    const { email, password, rol } = req.body;

    try {
        const exiteEmail = await Usuario.findOne({ email: email });

        if (exiteEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'Email ya existe'
            });
        }

        if(rol && rol != 'ADMIN' && rol != 'MEDICO' && rol != 'PACIENTE'){
            return res.status(400).json({
                ok: false,
                msg: 'Rol no permitido'
            });
        }

        const salt = bcrypt.genSaltSync();
       
        const cpassword = bcrypt.hashSync(password, salt); // y aqui ciframos la contraseña 

        const usuario = new Usuario(req.body);
        usuario.password = cpassword;
        await usuario.save();

        res.json({
            ok: true,
            msg: 'crearusuarios',
            usuario
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok: false,
            msg: 'Error creando usuario'
        });
    }

    /* if(!erroresVal.isEmpty()){
        return res.status(400).json({
            ok: false,
            errores: erroresVal.mapped()
        });
    }

    res.json({
        ok: true,
        msg: 'crearusuarios',
        
    });*/
}
const actualizarUsuario = async(req, res = response) => {

    const { password, email, ...object } = req.body;
    const uid = req.params.id;

    try{
        const existeEmail = await Usuario.findOne({ email: email });

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
        const usuario = await Usuario.findByIdAndUpdate(uid, object, { new: true });

        res.json({
            ok: true,
            msg: 'Usuario actualizado',
            usuario
        });

    } catch (error) {
        //console.log(error);
        res.status(400).json({
            ok: false,
            msg: 'Error actualizando usuario'
        });
    }

    /*res.json({
        ok: true,
        msg: 'actualizarUsuario'
    });*/
}

const borrarUsuario = async(req, res = response) => {
    
    const uid = req.params.id;

    try {
        const existeUsuario = await Usuario.findById(uid);
        if(!existeUsuario){
            return res.status(400).json({
                ok: true,
                msg: 'Usuario no existe'
            });
        }
        const resultado = await Usuario.findByIdAndDelete(uid);

        res.json({
            ok: true,
            msg: 'Usuario eliminado',
            resultado
        });
    } catch (error) {
        //console.log(error);
        res.status(400).json({
            ok: false,
            msg: 'Error borrando usuario'
        });
    }
    /*res.json({
        ok: true,
        msg: 'borrarUsuario'
    });*/
}

module.exports = { obtenerUsuarios, crearUsuario, actualizarUsuario, borrarUsuario }
