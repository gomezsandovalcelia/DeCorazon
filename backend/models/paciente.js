const { Schema, model } = require('mongoose');

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
}, { collection: 'Pacientes' });
/*
PacienteSchema.method('toJSON', function() {
    const { _id, password, ...object } = this.toObject();
    object.uid = _id;
    return object;
})*/

module.exports = model('Paciente', PacienteSchema);