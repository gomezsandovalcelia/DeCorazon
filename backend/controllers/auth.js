const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarios');
const Paciente = require('../models/paciente');
const { generarJWT } = require('../helpers/jwt');

const login = async(req, res = response) => {
    //console.log('Datos recibidos del cliente:', req.body);
    const { email, password } = req.body;

    try {
        const usuarioBD = await Paciente.findOne({ email }, '_id rol password');
        //console.log('Usuario encontrado en la BD:', usuarioBD);
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }
        if (!usuarioBD) {
            return res.status(200).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }
        
        const validPassword = bcrypt.compareSync(password, usuarioBD.password);
        //console.log('Validación de contraseña:', validPassword);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }
        const { _id, rol } = usuarioBD;
        const token = await generarJWT(usuarioBD._id, usuarioBD.rol);
        res.json({
            ok: true,
            msg: 'login',
            _id,
            rol,
            token
        });   
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error en login',
            token: ''
        });
    }
    /*res.json({
        ok: true,
        msg: 'login',
        token: 'token'
    });*/
}
/*
async function buscarUsuarioPorIDyRol(id, rolEsperado) {
    try {
        switch (rolEsperado) {
            case 'PACIENTE':
                return await Paciente.findOne({ where: { ID_Paciente: id, Rol: rolEsperado } });
            case 'MEDICO':
                return await Medico.findOne({ where: { ID_Medico: id, Rol: rolEsperado } });
            default:
                return null;
        }
    } catch (error) {
        console.error(`Error al buscar usuario por ID y rol ${rolEsperado}:`, error);
        return null;
    }
}*/

module.exports = { login }