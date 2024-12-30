const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarios');
const { generarJWT } = require('../helpers/jwt');

const login = async(req, res = response) => {

    const { email, password } = req.body;

    try {
        const usuarioBD = await Usuario.findOne({ email }, '_id rol password');
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }
        const validPassword = bcrypt.compareSync(password, usuarioBD.password);
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
module.exports = { login }