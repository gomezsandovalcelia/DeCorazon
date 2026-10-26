// routes/medico.js
const { Router } = require('express');
const {
    obtenerMedicos,
    crearMedico,
    obtenerPacientesAsignados,
    obtenerMedicoPorId
} = require('../controllers/medico');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarRolMedico } = require('../middleware/validar-rol-medico');
const { validarMismoUsuario } = require('../middleware/validar-acceso');

const router = Router();

// Obtener todos los médicos (solo médicos)
router.get('/', [validarJWT, validarRolMedico], obtenerMedicos);

// Crear médico (solo un médico puede dar de alta a otro)
router.post('/', [
    validarJWT,
    validarRolMedico,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    validarCampos
], crearMedico);

// Obtener los pacientes asignados al médico que hace la petición
router.get('/:id/pacientes', [
    validarJWT,
    validarRolMedico,
    validarMismoUsuario
], obtenerPacientesAsignados);

// Perfil del propio médico
router.get('/:id', [
    validarJWT,
    validarRolMedico,
    validarMismoUsuario
], obtenerMedicoPorId);

module.exports = router;
