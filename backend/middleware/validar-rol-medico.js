// middleware/validar-rol-medico.js
const { response } = require('express');

const validarRolMedico = (req, res = response, next) => {
    if (!req.rol) {
        return res.status(500).json({
            ok: false,
            msg: 'Se quiere verificar el rol sin validar el token primero'
        });
    }

    const rol = req.rol;

    if (rol !== 'MEDICO') {
        return res.status(403).json({
            ok: false,
            msg: 'No tiene los privilegios necesarios para esta acción'
        });
    }

    next();
};

module.exports = {
    validarRolMedico
};