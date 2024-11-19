/*
Importacion de modulos 
*/
const express = require('express');

const cors = require('cors');
require('dotenv').config();
const { dbConnection } = require('./database/configdb');

//crear una app de express 
const app = express();

dbConnection();

//abrir la app en el puerto 3000
app.use(cors());
app.use(express.json());

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/login', require('./routes/auth'));

app.listen(process.env.PORT, () => {
    console.log('Server on port ', process.env.PORT);
});

/*app.get('/', (req, res) => {
    res.json({ 
        ok: true, 
        msg: 'servidor activo'
    });
});*/