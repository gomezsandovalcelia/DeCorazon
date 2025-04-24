const { Schema, model } = require("mongoose");

const preguntaSchema = Schema({
    _id: { type: Schema.Types.ObjectId , auto: true },
    shortId: { type: String },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    // Nuevos campos para manejar el flujo de preguntas
    questionType: { type: String, enum: ['initial', 'followup'], default: 'initial' },
    nextQuestions: {
        type: Map,
        of: {
            questionId: String,
            condition: String // La respuesta que lleva a esta pregunta
        }
    },
    alertConditions: [String] // Respuestas que generan alerta
}, { collection: "Preguntas" });

module.exports = model("Pregunta", preguntaSchema);