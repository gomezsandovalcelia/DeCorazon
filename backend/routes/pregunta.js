const express = require("express");
const router = express.Router();
const questionController = require("../controllers/pregunta");

// Ruta para obtener la pregunta del día
router.get("/preguntadeldia/:patientId", questionController.getQuestionOfTheDay);

// Ruta para guardar la respuesta
router.post('/save-response', questionController.saveResponse);

module.exports = router;
