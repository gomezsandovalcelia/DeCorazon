const { response } = require('express');
const rolesPermitidos = ['ADMIN', 'MEDICO', 'PACIENTE'];

const validarRol = (req, res = response, next) => {
    const rol = req.body.rol;

    if (rol && !rolesPermitidos.includes(rol)) {
        return res.status(400).json({
            ok: false,
            msg: 'Rol no permitido'
        });
    }
    next();
}

module.exports = { validarRol }