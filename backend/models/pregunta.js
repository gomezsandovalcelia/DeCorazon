// models/pregunta.js
const { Schema, model } = require("mongoose");

const preguntaSchema = Schema({
    _id: { 
        type: Schema.Types.ObjectId, 
        auto: true 
    },
    shortId: { 
        type: String,
        required: true,
        unique: true
    },
    question: { 
        type: String, 
        required: true 
    },
    options: { 
        type: [String], 
        required: true 
    },
    // Tipo de pregunta (inicial o de seguimiento)
    questionType: { 
        type: String, 
        enum: ['initial', 'followup'], 
        default: 'initial' 
    },
    // Configuración de preguntas siguientes (como objeto/Map)
    nextQuestions: {
        type: Map,
        of: {
            questionId: String,
            condition: String,
            triggerAlert: Boolean,
            endQuestionnaire: Boolean
        }
    },
    // Condiciones que generan alertas
    alertConditions: [String]
}, { 
    collection: "Preguntas",
    timestamps: true
});

// Método para validar integridad del árbol
preguntaSchema.methods.validateTree = async function() {
    // Si no tiene nextQuestions, no hay nada que validar
    if (!this.nextQuestions || this.nextQuestions.size === 0) {
        return true;
    }

    const Pregunta = model("Pregunta");
    
    // Verificar cada nextQuestion
    for (const [respuesta, config] of this.nextQuestions.entries()) {
        // Si tiene questionId, verificar que existe
        if (config.questionId && !config.endQuestionnaire) {
            const nextQuestion = await Pregunta.findOne({ shortId: config.questionId });
            if (!nextQuestion) {
                console.error(`La pregunta con shortId ${config.questionId} no existe`);
                return false;
            }
        }
    }
    
    return true;
};

module.exports = model("Pregunta", preguntaSchema);