const express = require("express");
const router = express.Router();
const {getFirstQuestion, 
    getNextQuestion, 
    saveResponse, 
    sendAlert, 
    finishQuestionnaire } = require("../controllers/pregunta");

// Ruta para obtener la pregunta del día
//router.get("/preguntadeldia/:patientId", questionController.getQuestionOfTheDay);

// Ruta para guardar la respuesta
//router.post('/save-response', questionController.saveResponse);
router.get('/first-question/:patientId', getFirstQuestion);
router.get('/next-question/:patientId/:questionId/:answer', getNextQuestion);
router.post('/save-response', saveResponse);
router.post('/send-alert', sendAlert);
router.post('/finish-questionnaire', finishQuestionnaire);


module.exports = router;
