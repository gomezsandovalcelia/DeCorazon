/* Importacion de modulos  */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

//crear una app de express
const app = express();

// Orígenes permitidos: ng serve, ionic serve y la app nativa de Capacitor
const origenesPermitidos = process.env.CORSORIGIN
    ? process.env.CORSORIGIN.split(',').map(origen => origen.trim())
    : ['http://localhost:4200', 'http://localhost:8100', 'capacitor://localhost', 'https://localhost', 'http://localhost'];

// Límite de intentos de login por IP para dificultar ataques de fuerza bruta
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: { ok: false, msg: 'Demasiados intentos de login, inténtelo más tarde' }
});

//configurar middlewares
app.use(helmet());
app.use(cors({ origin: origenesPermitidos }));
app.use(express.json());

// Registrar rutas
app.use('/api/pregunta', require('./routes/pregunta'));
app.use('/api/paciente', require('./routes/paciente'));
app.use('/api/login', limiteLogin, require('./routes/auth'));
app.use('/api/medico', require('./routes/medico'));
app.use('/api/respuesta', require('./routes/respuesta'));

module.exports = app;
