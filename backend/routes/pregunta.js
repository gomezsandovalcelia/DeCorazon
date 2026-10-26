// routes/pregunta.js
const express = require('express');
const router = express.Router();
const { 
  getFirstQuestion,
  getNextQuestion,
  saveResponse,
  sendAlert,
  finishQuestionnaire,
  debugQuestions, getAllQuestions, getQuestionById
} = require('../controllers/pregunta');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarRolMedico } = require('../middleware/validar-rol-medico');
const { validarAccesoPaciente } = require('../middleware/validar-acceso');

// Ruta para obtener la primera pregunta del cuestionario
router.get('/first-question/:pacienteId', [
  validarJWT,
  validarAccesoPaciente(req => req.params.pacienteId)
], getFirstQuestion);

// Ruta para obtener la siguiente pregunta basada en la respuesta
router.get('/next-question/:pacienteId/:currentQuestionId/:answer', [
  validarJWT,
  validarAccesoPaciente(req => req.params.pacienteId)
], getNextQuestion);

// Ruta para guardar la respuesta del paciente
router.post('/save-response', [
  validarJWT,
  validarAccesoPaciente(req => req.body.pacienteId)
], saveResponse);

// Ruta para enviar una alerta al personal sanitario
router.post('/send-alert', [
  validarJWT,
  validarAccesoPaciente(req => req.body.patientId)
], sendAlert);

// Ruta para finalizar el cuestionario
router.post('/finish-questionnaire', [
  validarJWT,
  validarAccesoPaciente(req => req.body.patientId)
], finishQuestionnaire);

// Ruta para debugging - visualizar el árbol de preguntas
router.get('/debug-questions', [validarJWT, validarRolMedico], debugQuestions);
router.get('/all-questions', validarJWT, getAllQuestions);
router.get('/question/:id', validarJWT, getQuestionById);
module.exports = router;