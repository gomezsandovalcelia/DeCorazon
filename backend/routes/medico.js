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

const router = Router();

// Obtener todos los médicos (ruta protegida, solo para admin o médicos)
router.get('/', [validarJWT, validarRolMedico], obtenerMedicos);

// Crear médico (esta ruta podría estar restringida para un admin)
router.post('/', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    validarCampos
], crearMedico);

// Obtener los pacientes asignados a un médico
router.get('/:id/pacientes', [
    validarJWT,
    validarRolMedico
], obtenerPacientesAsignados);
// En routes/medico.js

router.get('/:id/pacientes', [
    validarJWT,
    validarRolMedico  // Si quieres restringir esta ruta solo a médicos
], obtenerPacientesAsignados);

router.get('/:id', obtenerMedicoPorId);

module.exports = router;