require('dotenv').config();
const app = require('./app');
const { dbConnection } = require('./database/configdb');

// Arrancar el servidor solo cuando la base de datos esté conectada
const iniciarServidor = async () => {
    try {
        await dbConnection();
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }

    app.listen(process.env.PORT, () => {
        console.log('Server on port ', process.env.PORT);
    });
};

iniciarServidor();
