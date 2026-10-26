const { response } = require('express');
const bcrypt = require('bcryptjs');
const Paciente = require('../models/paciente');
const Medico = require('../models/medico');
const { generarJWT } = require('../helpers/jwt');

const login = async(req, res = response) => {
    const { email, password } = req.body;

    try {
        // Buscar primero en pacientes y, si no está, en médicos.
        // La contraseña tiene select: false en los modelos, así que hay que pedirla
        let usuarioBD = await Paciente.findOne({ email }).select('_id rol +password');
        let tipo = 'PACIENTE';

        if (!usuarioBD) {
            usuarioBD = await Medico.findOne({ email }).select('_id rol +password');
            tipo = 'MEDICO';
        }

        // Mismo mensaje si no existe el usuario o la contraseña es incorrecta
        if (!usuarioBD || !bcrypt.compareSync(password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const { _id, rol } = usuarioBD;
        const token = await generarJWT(_id, rol);

        res.json({
            ok: true,
            msg: 'login',
            _id,
            rol,
            tipo,
            token
        });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error en login',
            token: ''
        });
    }
}

module.exports = { login }
