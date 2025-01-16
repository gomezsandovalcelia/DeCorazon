const { Router } = require('express');
const { obtenerPacientes, crearPaciente, actualizarPaciente, borrarPaciente, obtenerTratamientos, obtenerEjercicios, actualizarCheckpoint, obtenerPacientePorId, obtenerMedidas } = require('../controllers/paciente');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarRol } = require('../middleware/validar-rol');
const { validarJWT } = require('../middleware/validar-jwt');

const router = Router();

router.get('/', obtenerPacientes, validarJWT);

router.post('/', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    validarRol,
    validarCampos
], crearPaciente);

router.put('/:id', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    check('id', 'El identificador no es válido').isMongoId(),
    validarRol,
    validarCampos
], actualizarPaciente);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarPaciente);

router.get('/:id/treatments', validarJWT, obtenerTratamientos);

router.get('/:id/exercise_routines', validarJWT, obtenerEjercicios);

router.get('/:id', validarJWT, obtenerPacientePorId);

router.get('/:id/measurements', validarJWT, obtenerMedidas);

router.put('/:id/exercise_routines/:exerciseId',[
    //check('checkpoint', 'El argumento checkpoint es obligatorio').not().isEmpty(),
    validarJWT,
    validarRol
],
    actualizarCheckpoint);

module.exports = router;