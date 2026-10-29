const Paciente = require('../models/paciente');
const Medico = require('../models/medico');

// El login busca el email en Paciente y luego en Medico, así que no puede repetirse entre ambas colecciones.
// excluirId permite que un usuario conserve su propio email al actualizar su perfil
const emailEnUso = async (email, excluirId = null) => {
    const filtro = excluirId ? { email, _id: { $ne: excluirId } } : { email };
    const [paciente, medico] = await Promise.all([Paciente.exists(filtro), Medico.exists(filtro)]);
    return !!(paciente || medico);
};

module.exports = { emailEnUso };
