// routes/respuesta.routes.js
const { Router } = require('express');
const { 
    obtenerRespuestas, 
    obtenerRespuestasPaciente, 
    getAlertasPacientes,
    actualizarAlertaRespuesta,
    verificarAlertasPaciente
} = require('../controllers/respuesta');

const router = Router();

// Rutas
router.get('/', obtenerRespuestas);
router.get('/paciente/:pacienteId', obtenerRespuestasPaciente);
router.get('/alertas', getAlertasPacientes);
router.put('/:id/alerta', actualizarAlertaRespuesta);
router.get('/paciente/:pacienteId/tiene-alertas', verificarAlertasPaciente);


module.exports = router;