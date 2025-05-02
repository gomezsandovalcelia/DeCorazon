const { Schema, model }  = require("mongoose");

const respuestaSchema = Schema({
    pacienteId: {
      type: Schema.Types.ObjectId,
      ref: 'Paciente',
      required: true
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Pregunta',
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    triggeredAlert: {
      type: Boolean,
      default: false
    }
  }, { collection: "Respuestas" });

module.exports = model("Respuesta", respuestaSchema);
