/* Importacion de modulos  */
const express = require('express'); 
const cors = require('cors');
require('dotenv').config();
const { dbConnection } = require('./database/configdb'); 

//crear una app de express 
const app = express(); 

dbConnection(); 

//configurar middlewares
app.use(cors());
app.use(express.json()); 

// Registrar rutas (sólo una vez por ruta)
app.use('/api/pregunta', require('./routes/pregunta'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/paciente', require('./routes/paciente'));
app.use('/api/login', require('./routes/auth'));
app.use('/api/medico', require('./routes/medico'));
app.use('/api/respuesta', require('./routes/respuesta')); 

// Eliminar esta parte redundante:
// const questionRoutes = require("./routes/pregunta");
// app.use("/api/pregunta", questionRoutes);

app.listen(process.env.PORT, () => {    
    console.log('Server on port ', process.env.PORT);
});