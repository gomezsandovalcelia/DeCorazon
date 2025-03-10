const { Schema, model } = require("mongoose");

const preguntaSchema = Schema({
    _id: { type: String },
    question: { type: String, required: true },
    options: { type: [String], required: true }
}, { collection: "Preguntas" });

module.exports = model("Pregunta", preguntaSchema);
