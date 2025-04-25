const { Schema, model }  = require("mongoose");

const respuestaSchema = Schema({
    //_id: { type: String },
    patientId: { type: String, required: true },
    questionId: { type: String, ref: "Pregunta", required: true },
    answer: { type: String, required: true },
    date: { type: String, required: true },
    alerta: { type: Boolean, default: false }
}, { collection: 'Respuestas' });

module.exports = model("Respuesta", respuestaSchema);
