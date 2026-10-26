const { Schema, model } = require('mongoose');

const PastilleroSchema = new Schema({
    day: { type: String, required: true }, // Lunes, Martes, etc.
    morning: { type: String, default: "" }, // Medicación por la mañana
    afternoon: { type: String, default: "" }, // Medicación por la tarde
    night: { type: String, default: "" } // Medicación por la noche
}, { _id: false });

const TreatmentSchema = new Schema({
    date: { type: String, required: true },
    description: { type: String, required: true }
});

const MeasurementSchema = new Schema({
    date: { type: String},
    weight: { type: Number },
    heart_rate: { type: Number},
    blood_pressure: { type: String}
}, { _id: false });

const ExerciseSchema = new Schema({
    _id: { type: Number, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    checkpoint: { type: Boolean }
});

const PacienteSchema = Schema({
    nombre: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    altura: {
        type: Number,
        default: null
    },
    rol: {
        type: String,
        required: true,
        default: 'PACIENTE'
    },
    medico_id: {
        type: Number,
        ref: 'Medico',
        required: true
    },
    treatments: [TreatmentSchema], 
    pastillero: [PastilleroSchema],
    measurements: [MeasurementSchema],
    exercise_routines: [ExerciseSchema],
    // Último cuestionario diario completado y última alerta enviada al sanitario
    lastQuestionnaire: { type: Date },
    lastAlert: {
        date: { type: Date },
        reason: { type: String }
    }
}, { collection: 'Pacientes' });

// No devolver nunca el hash de la contraseña en las respuestas
PacienteSchema.method('toJSON', function() {
    const { __v, password, ...object } = this.toObject();
    return object;
});

module.exports = model('Paciente', PacienteSchema);