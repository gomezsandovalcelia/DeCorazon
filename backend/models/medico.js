const { Schema, model } = require('mongoose');

const MedicoSchema = Schema({
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
        default: 'MEDICO'
    },
    pacientes: [{
        type: Schema.Types.ObjectId,
        ref: 'Paciente'
    }]
}, { collection: 'Medicos' });


module.exports = model('Medico', MedicoSchema);