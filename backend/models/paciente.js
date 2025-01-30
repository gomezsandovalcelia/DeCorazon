const { Schema, model } = require('mongoose');

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
    measurements: [MeasurementSchema],
    exercise_routines: [ExerciseSchema]
}, { collection: 'Pacientes' });
/*
PacienteSchema.method('toJSON', function() {
    const { _id, password, ...object } = this.toObject();
    object.uid = _id;
    return object;
})*/

module.exports = model('Paciente', PacienteSchema);