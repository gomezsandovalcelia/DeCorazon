// routes/respuesta.routes.js
const { Router } = require('express');
const {
    obtenerRespuestas,
    obtenerRespuestasPaciente,
    getAlertasPacientes,
    actualizarAlertaRespuesta,
    verificarAlertasPaciente
} = require('../controllers/respuesta');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarRolMedico } = require('../middleware/validar-rol-medico');
const { validarAccesoPaciente } = require('../middleware/validar-acceso');

const router = Router();

// Rutas
router.get('/', [validarJWT, validarRolMedico], obtenerRespuestas);
router.get('/paciente/:pacienteId', [
    validarJWT,
    validarAccesoPaciente(req => req.params.pacienteId)
], obtenerRespuestasPaciente);
router.get('/alertas', [validarJWT, validarRolMedico], getAlertasPacientes);
router.put('/:id/alerta', [validarJWT, validarRolMedico], actualizarAlertaRespuesta);
router.get('/paciente/:pacienteId/tiene-alertas', [
    validarJWT,
    validarAccesoPaciente(req => req.params.pacienteId)
], verificarAlertasPaciente);


module.exports = router;
