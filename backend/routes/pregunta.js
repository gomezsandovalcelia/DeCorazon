// routes/pregunta.js
const express = require('express');
const router = express.Router();
const { 
  getFirstQuestion,
  getNextQuestion,
  saveResponse,
  sendAlert,
  finishQuestionnaire,
  debugQuestions
} = require('../controllers/pregunta');

// Ruta para obtener la primera pregunta del cuestionario
router.get('/first-question/:pacienteId', getFirstQuestion);

// Ruta para obtener la siguiente pregunta basada en la respuesta
router.get('/next-question/:pacienteId/:currentQuestionId/:answer', getNextQuestion);

// Ruta para guardar la respuesta del paciente
router.post('/save-response', saveResponse);

// Ruta para enviar una alerta al personal sanitario
router.post('/send-alert', sendAlert);

// Ruta para finalizar el cuestionario
router.post('/finish-questionnaire', finishQuestionnaire);

// Ruta para debugging - visualizar el árbol de preguntas
router.get('/debug-questions', debugQuestions);

module.exports = router;