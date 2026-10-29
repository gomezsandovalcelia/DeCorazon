// routes/medico.js
const { Router } = require('express');
const {
    obtenerMedicos,
    crearMedico,
    obtenerPacientesAsignados,
    obtenerMedicoPorId
} = require('../controllers/medico');
const { check } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarRolMedico } = require('../middleware/validar-rol-medico');
const { validarMismoUsuario } = require('../middleware/validar-acceso');

const router = Router();

// Límite de registros por IP, ya que el registro de médicos es público
const limiteRegistro = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: { ok: false, msg: 'Demasiados registros, inténtelo más tarde' }
});

// Obtener todos los médicos (solo médicos)
router.get('/', [validarJWT, validarRolMedico], obtenerMedicos);

// Registro público: solo los médicos se registran; los pacientes los da de alta su médico
router.post('/', [
    limiteRegistro,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').isEmail(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
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
