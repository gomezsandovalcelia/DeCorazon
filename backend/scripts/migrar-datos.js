// scripts/migrar-datos.js
// Adapta los pacientes guardados al esquema actual:
//  - elimina medico_id (la relación médico-paciente está en Medico.pacientes)
//  - convierte a Date las fechas guardadas como texto en treatments,
//    measurements y exercise_routines
// Antes de cambiar nada guarda una copia de la colección en backups/.
// Se puede ejecutar varias veces: lo que ya está migrado no se toca.
// Uso: npm run migrar
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ARRAYS_CON_FECHA = ['treatments', 'measurements', 'exercise_routines'];

const guardarCopia = (pacientes) => {
    const carpeta = path.join(__dirname, '..', 'backups');
    fs.mkdirSync(carpeta, { recursive: true });
    const fecha = new Date().toISOString().replace(/[:.]/g, '-');
    const fichero = path.join(carpeta, `Pacientes-${fecha}.json`);
    fs.writeFileSync(fichero, JSON.stringify(pacientes, null, 2));
    return fichero;
};

// Devuelve la fecha convertida o null si no hay que cambiarla
const convertirFecha = (valor) => {
    if (typeof valor !== 'string') return null;
    const fecha = new Date(valor);
    return isNaN(fecha.getTime()) ? null : fecha;
};

const migrar = async () => {
    await mongoose.connect(process.env.DBCONECTION);
    const coleccion = mongoose.connection.db.collection('Pacientes');

    const pacientes = await coleccion.find({}).toArray();
    console.log(`Copia de seguridad guardada en ${guardarCopia(pacientes)}`);

    let pacientesCambiados = 0;
    let fechasConvertidas = 0;
    let medicoIdEliminados = 0;

    for (const paciente of pacientes) {
        const set = {};
        const unset = {};

        if ('medico_id' in paciente) {
            unset.medico_id = '';
            medicoIdEliminados++;
        }

        for (const campo of ARRAYS_CON_FECHA) {
            (paciente[campo] || []).forEach((elemento, i) => {
                const fecha = convertirFecha(elemento.date);
                if (fecha) {
                    set[`${campo}.${i}.date`] = fecha;
                    fechasConvertidas++;
                }
            });
        }

        const cambios = {};
        if (Object.keys(set).length) cambios.$set = set;
        if (Object.keys(unset).length) cambios.$unset = unset;

        if (Object.keys(cambios).length) {
            await coleccion.updateOne({ _id: paciente._id }, cambios);
            pacientesCambiados++;
        }
    }

    console.log(`Pacientes revisados: ${pacientes.length}`);
    console.log(`Pacientes modificados: ${pacientesCambiados}`);
    console.log(`medico_id eliminados: ${medicoIdEliminados}`);
    console.log(`Fechas convertidas a Date: ${fechasConvertidas}`);
};

migrar()
    .catch((error) => {
        console.error('Error en la migración:', error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
