const { Router } = require('express');
const { obtenerPacientes, crearPaciente, actualizarPaciente,
    borrarPaciente, obtenerTratamientos, obtenerEjercicios, actualizarCheckpoint,
    obtenerPacientePorId, obtenerMedidas, cambiarMedidas,
    agregarEjercicio, agregarTratamiento, obtenerPastillero,
    actualizarMedicacionDia} = require('../controllers/paciente');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarRolMedico } = require('../middleware/validar-rol-medico');
const { validarAccesoPaciente } = require('../middleware/validar-acceso');

const router = Router();

// Acceso permitido al propio paciente o a un médico que lo tenga asignado
const accesoPaciente = [validarJWT, validarAccesoPaciente()];
// Acceso permitido solo a un médico que tenga asignado al paciente
const accesoMedico = [validarJWT, validarRolMedico, validarAccesoPaciente()];

router.get('/', [validarJWT, validarRolMedico], obtenerPacientes);

router.post('/', [
    validarJWT,
    validarRolMedico,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    validarCampos
], crearPaciente);

router.put('/:id', [
    ...accesoPaciente,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').isEmail(),
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], actualizarPaciente);

router.delete('/:id', [
    ...accesoMedico,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarPaciente);

router.get('/:id/treatments', accesoPaciente, obtenerTratamientos);

router.get('/:id/exercise_routines', accesoPaciente, obtenerEjercicios);

router.get('/:id', accesoPaciente, obtenerPacientePorId);

router.get('/:id/measurements', accesoPaciente, obtenerMedidas);

router.put('/:id/exercise_routines/:exerciseId', accesoPaciente, actualizarCheckpoint);

router.put('/:id/measurements', accesoPaciente, cambiarMedidas);

// Agregar tratamiento a un paciente
router.post('/:id/tratamiento', accesoMedico, agregarTratamiento);

// Agregar ejercicio a un paciente
router.post('/:id/ejercicio', accesoMedico, agregarEjercicio);

router.get('/:id/pastillero', accesoPaciente, obtenerPastillero);

router.put('/:id/pastillero/:day', accesoMedico, actualizarMedicacionDia);

module.exports = router;
