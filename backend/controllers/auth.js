const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarios');
const Paciente = require('../models/paciente');
const Medico = require('../models/medico');
const { generarJWT } = require('../helpers/jwt');

// En controllers/auth.js
const login = async(req, res = response) => {
    const { email, password } = req.body;
    console.log('Intento de login con:', email);
    
    try {
        // Buscar primero en pacientes
        let usuarioBD = await Paciente.findOne({ email }, '_id rol password');
        console.log('Resultado búsqueda en pacientes:', usuarioBD ? 'Encontrado' : 'No encontrado');
        
        let tipo = 'PACIENTE';
        
        // Si no se encuentra en pacientes, buscar en médicos
        if (!usuarioBD) {
            console.log('Buscando en colección de médicos...');
            usuarioBD = await Medico.findOne({ email }, '_id rol password');
            console.log('Resultado búsqueda en médicos:', usuarioBD ? 'Encontrado' : 'No encontrado');
            tipo = 'MEDICO';
        }
        
        // Verificar que se encontró un usuario
        if (!usuarioBD) {
            console.log('No se encontró un usuario con ese email');
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }
        
        // Validar la contraseña
        console.log('Validando contraseña...');
        const validPassword = bcrypt.compareSync(password, usuarioBD.password);
        console.log('¿Contraseña válida?:', validPassword);
        
        if (!validPassword) {
            console.log('Contraseña incorrecta');
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }
        
        // Generar el token
        console.log('Generando token...');
        const { _id, rol } = usuarioBD;
        console.log('ID:', _id, 'ROL:', rol);
        
        try {
            const token = await generarJWT(_id, rol);
            console.log('Token generado correctamente');
            
            res.json({
                ok: true,
                msg: 'login',
                _id,
                rol,
                tipo,
                token
            });
        } catch (tokenError) {
            console.error('Error al generar el token:', tokenError);
            return res.status(500).json({
                ok: false,
                msg: 'Error al generar el token',
                token: ''
            });
        }
        
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(400).json({
            ok: false,
            msg: 'Error en login',
            token: ''
        });
    }
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