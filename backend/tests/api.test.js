// Tests de la API contra MongoDB local, en una base de datos de prueba que se borra al terminar.
// Requiere MongoDB en marcha. La BD se puede cambiar con la variable TEST_DBCONECTION.
process.env.JWTSECRET = 'secreto_de_test';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../app');

const DB = process.env.TEST_DBCONECTION || 'mongodb://localhost:27017/corazon_test';

let pacienteA, pacienteB, medico, pregunta;
let tokenA, tokenMedico;

const nuevoPaciente = (nombre, email, password) => ({
    nombre, apellidos: nombre, email, password, rol: 'PACIENTE',
    treatments: [], pastillero: [], measurements: [], exercise_routines: []
});

const login = async (email) => {
    const res = await request(app).post('/api/login').send({ email, password: '1234' });
    return res.body.token;
};

beforeAll(async () => {
    await mongoose.connect(DB);
    await mongoose.connection.dropDatabase();
    const db = mongoose.connection.db;
    const hash = bcrypt.hashSync('1234', 10);

    pacienteA = (await db.collection('Pacientes').insertOne(nuevoPaciente('A', 'a@test.es', hash))).insertedId;
    pacienteB = (await db.collection('Pacientes').insertOne(nuevoPaciente('B', 'b@test.es', hash))).insertedId;
    medico = (await db.collection('Medicos').insertOne({
        nombre: 'M', apellidos: 'M', email: 'm@test.es', password: hash, rol: 'MEDICO', pacientes: [pacienteA]
    })).insertedId;
    pregunta = (await db.collection('Preguntas').insertOne({
        shortId: 'q1', question: '¿Cómo te encuentras hoy?', options: ['Bien', 'Mal'], questionType: 'initial',
        nextQuestions: { Mal: { triggerAlert: true, endQuestionnaire: true } }, alertConditions: []
    })).insertedId;

    tokenA = await login('a@test.es');
    tokenMedico = await login('m@test.es');
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
});

describe('Login', () => {
    test('devuelve token y rol del paciente y del médico', async () => {
        const res = await request(app).post('/api/login').send({ email: 'a@test.es', password: '1234' });
        expect(res.status).toBe(200);
        expect(res.body.rol).toBe('PACIENTE');
        expect(res.body.token).toBeTruthy();
        expect(tokenMedico).toBeTruthy();
    });

    test('rechaza una contraseña incorrecta', async () => {
        const res = await request(app).post('/api/login').send({ email: 'a@test.es', password: 'mal' });
        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
    });
});

describe('Autenticación y contraseñas', () => {
    test('sin token responde 401', async () => {
        expect((await request(app).get('/api/paciente')).status).toBe(401);
        expect((await request(app).get(`/api/pregunta/first-question/${pacienteA}`)).status).toBe(401);
    });

    test('con un token no válido responde 401', async () => {
        const res = await request(app).get(`/api/paciente/${pacienteA}`).set('x-token', 'no-valido');
        expect(res.status).toBe(401);
    });

    test('ninguna respuesta incluye el hash de la contraseña', async () => {
        const respuestas = [
            await request(app).get('/api/paciente').set('x-token', tokenMedico),
            await request(app).get(`/api/paciente/${pacienteA}`).set('x-token', tokenA),
            await request(app).get(`/api/medico/${medico}/pacientes`).set('x-token', tokenMedico),
            await request(app).get(`/api/medico/${medico}`).set('x-token', tokenMedico)
        ];
        for (const res of respuestas) {
            expect(res.status).toBe(200);
            expect(res.text).not.toContain('password');
        }
    });
});

describe('Acceso a los datos de los pacientes', () => {
    test('un paciente ve sus datos pero no los de otro', async () => {
        expect((await request(app).get(`/api/paciente/${pacienteA}/measurements`).set('x-token', tokenA)).status).toBe(200);
        expect((await request(app).get(`/api/paciente/${pacienteB}/measurements`).set('x-token', tokenA)).status).toBe(403);
    });

    test('un médico ve a sus pacientes pero no a los de otros', async () => {
        expect((await request(app).get(`/api/paciente/${pacienteA}`).set('x-token', tokenMedico)).status).toBe(200);
        expect((await request(app).get(`/api/paciente/${pacienteB}`).set('x-token', tokenMedico)).status).toBe(403);
    });

    test('solo los médicos listan pacientes', async () => {
        expect((await request(app).get('/api/paciente').set('x-token', tokenA)).status).toBe(403);
    });

    test('cualquiera puede registrarse como médico, sin token y sin elegir el rol', async () => {
        const res = await request(app).post('/api/medico')
            .send({ nombre: 'X', apellidos: 'X', email: 'x@test.es', password: '123456', rol: 'PACIENTE' });
        expect(res.status).toBe(200);
        expect(res.body.medico.rol).toBe('MEDICO');
        expect(res.text).not.toContain('password');
    });

    test('un email no puede repetirse entre pacientes y médicos', async () => {
        const medicoConEmailDePaciente = await request(app).post('/api/medico')
            .send({ nombre: 'Y', apellidos: 'Y', email: 'a@test.es', password: '123456' });
        expect(medicoConEmailDePaciente.status).toBe(400);

        const pacienteConEmailDeMedico = await request(app).post('/api/paciente').set('x-token', tokenMedico)
            .send({ nombre: 'Y', apellidos: 'Y', email: 'm@test.es', password: '123456' });
        expect(pacienteConEmailDeMedico.status).toBe(400);
    });

    test('un paciente no ve el perfil de un médico', async () => {
        expect((await request(app).get(`/api/medico/${medico}`).set('x-token', tokenA)).status).toBe(403);
    });

    test('editar el perfil no permite cambiar el rol', async () => {
        const res = await request(app).put(`/api/paciente/${pacienteA}`).set('x-token', tokenA)
            .send({ nombre: 'A2', apellidos: 'A', email: 'a@test.es', rol: 'MEDICO' });
        expect(res.status).toBe(200);
        const doc = await mongoose.connection.db.collection('Pacientes').findOne({ _id: pacienteA });
        expect(doc.rol).toBe('PACIENTE');
        expect(doc.nombre).toBe('A2');
    });

    test('el pastillero, los tratamientos y los ejercicios solo los edita el médico', async () => {
        expect((await request(app).put(`/api/paciente/${pacienteA}/pastillero/Lunes`).set('x-token', tokenA)
            .send({ morning: 'x' })).status).toBe(403);
        expect((await request(app).put(`/api/paciente/${pacienteA}/pastillero/Lunes`).set('x-token', tokenMedico)
            .send({ morning: 'Sintrom' })).status).toBe(200);

        const fecha = new Date().toISOString();
        expect((await request(app).post(`/api/paciente/${pacienteA}/tratamiento`).set('x-token', tokenA)
            .send({ description: 'x', date: fecha })).status).toBe(403);
        expect((await request(app).post(`/api/paciente/${pacienteA}/tratamiento`).set('x-token', tokenMedico)
            .send({ description: 'Aspirina', date: fecha })).status).toBe(200);
        expect((await request(app).post(`/api/paciente/${pacienteA}/ejercicio`).set('x-token', tokenMedico)
            .send({ description: 'Andar', date: fecha })).status).toBe(200);
    });

    test('un médico crea un paciente con rol PACIENTE y queda asignado', async () => {
        const res = await request(app).post('/api/paciente').set('x-token', tokenMedico)
            .send({ nombre: 'C', apellidos: 'C', email: 'c@test.es', password: '123456', altura: 170, rol: 'MEDICO' });
        expect(res.status).toBe(200);
        expect(res.body.paciente.rol).toBe('PACIENTE');
        expect(res.text).not.toContain('password');
        const doc = await mongoose.connection.db.collection('Medicos').findOne({ _id: medico });
        expect(doc.pacientes.map(String)).toContain(String(res.body.paciente._id));

        const { measurements, treatments, exercise_routines, pastillero } = res.body.paciente;
        expect(measurements).toEqual([]);
        expect(treatments).toEqual([]);
        expect(exercise_routines).toEqual([]);
        expect(pastillero.map(d => d.day)).toEqual(['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']);
        expect(pastillero.every(d => !d.morning && !d.afternoon && !d.night)).toBe(true);
    });

    test('el alta de paciente exige una contraseña de al menos 6 caracteres', async () => {
        const res = await request(app).post('/api/paciente').set('x-token', tokenMedico)
            .send({ nombre: 'D', apellidos: 'D', email: 'd@test.es', password: '123' });
        expect(res.status).toBe(400);
    });

    test('el paciente cambia su contraseña si conoce la actual', async () => {
        const url = `/api/paciente/${pacienteB}/password`;
        const tokenB = await login('b@test.es');

        expect((await request(app).put(url).set('x-token', tokenA)
            .send({ actual: '1234', nueva: 'nueva123' })).status).toBe(403);
        expect((await request(app).put(url).set('x-token', tokenB)
            .send({ actual: 'mal', nueva: 'nueva123' })).status).toBe(400);
        expect((await request(app).put(url).set('x-token', tokenB)
            .send({ actual: '1234', nueva: 'nueva123' })).status).toBe(200);

        expect((await request(app).post('/api/login').send({ email: 'b@test.es', password: 'nueva123' })).status).toBe(200);
        expect((await request(app).post('/api/login').send({ email: 'b@test.es', password: '1234' })).status).toBe(400);
    });
});

describe('Medidas', () => {
    test('guarda unas medidas válidas con la fecha como Date', async () => {
        const res = await request(app).put(`/api/paciente/${pacienteA}/measurements`).set('x-token', tokenA)
            .send({ weight: 70, heart_rate: 72, blood_pressure: '120/80' });
        expect(res.status).toBe(200);
        const doc = await mongoose.connection.db.collection('Pacientes').findOne({ _id: pacienteA });
        expect(doc.measurements.at(-1).date).toBeInstanceOf(Date);
    });

    test.each([
        [{ weight: 5, heart_rate: 72, blood_pressure: '120/80' }, 'weight'],
        [{ weight: 70, heart_rate: 400, blood_pressure: '120/80' }, 'heart_rate'],
        [{ weight: 70, heart_rate: 72, blood_pressure: '120-80' }, 'blood_pressure']
    ])('rechaza valores fuera de rango (%j)', async (medidas, campo) => {
        const res = await request(app).put(`/api/paciente/${pacienteA}/measurements`).set('x-token', tokenA).send(medidas);
        expect(res.status).toBe(400);
        expect(res.body.errores[campo]).toBeDefined();
    });
});

describe('Cuestionario y alertas', () => {
    test('un paciente no puede pedir el cuestionario de otro', async () => {
        expect((await request(app).get(`/api/pregunta/first-question/${pacienteB}`).set('x-token', tokenA)).status).toBe(403);
    });

    test('responder con alerta, enviarla y terminar el cuestionario', async () => {
        const primera = await request(app).get(`/api/pregunta/first-question/${pacienteA}`).set('x-token', tokenA);
        expect(primera.status).toBe(200);
        expect(primera.body.completadoHoy).toBe(false);

        const respuesta = await request(app).post('/api/pregunta/save-response').set('x-token', tokenA)
            .send({ pacienteId: String(pacienteA), questionId: String(pregunta), answer: 'Mal' });
        expect(respuesta.status).toBe(200);
        expect(respuesta.body.requiresAlert).toBe(true);

        await request(app).post('/api/pregunta/send-alert').set('x-token', tokenA)
            .send({ patientId: String(pacienteA), reason: 'prueba' });
        await request(app).post('/api/pregunta/finish-questionnaire').set('x-token', tokenA)
            .send({ patientId: String(pacienteA) });

        const doc = await mongoose.connection.db.collection('Pacientes').findOne({ _id: pacienteA });
        expect(doc.lastAlert.reason).toBe('prueba');
        expect(doc.lastQuestionnaire).toBeInstanceOf(Date);

        const otraVez = await request(app).get(`/api/pregunta/first-question/${pacienteA}`).set('x-token', tokenA);
        expect(otraVez.body.completadoHoy).toBe(true);
        expect(otraVez.body.question).toBeNull();
    });

    test('el médico ve las alertas y respuestas solo de sus pacientes', async () => {
        expect((await request(app).get('/api/respuesta/alertas').set('x-token', tokenA)).status).toBe(403);

        const alertas = await request(app).get('/api/respuesta/alertas').set('x-token', tokenMedico);
        expect(alertas.status).toBe(200);
        expect(alertas.body.alertas).toHaveLength(1);

        expect((await request(app).get(`/api/respuesta/paciente/${pacienteA}`).set('x-token', tokenMedico)).status).toBe(200);
        expect((await request(app).get(`/api/respuesta/paciente/${pacienteB}`).set('x-token', tokenMedico)).status).toBe(403);

        const tieneAlertas = await request(app).get(`/api/respuesta/paciente/${pacienteA}/tiene-alertas`).set('x-token', tokenMedico);
        expect(tieneAlertas.body.tieneAlertas).toBe(true);
    });
});
