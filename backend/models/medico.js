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
        select: false
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

// No devolver nunca el hash de la contraseña en las respuestas
MedicoSchema.method('toJSON', function() {
    const { __v, password, ...object } = this.toObject();
    return object;
});


module.exports = model('Medico', MedicoSchema);