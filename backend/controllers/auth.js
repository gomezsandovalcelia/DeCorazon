const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarios');

const login = async(req, res = response) => {

    const { email, password } = req.body;

    try {
        const usuarioBD = await Usuario.findOne({ email }, ' password');
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
        res.json({
            ok: true,
            msg: 'login',
            token: 'token'
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