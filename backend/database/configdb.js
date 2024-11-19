const mongoose = require('mongoose');

const dbConnection = async () => {

    try {
        await mongoose.connect(process.env.DBCONECTION);
       /* await mongoose.connect(process.env.DBCONECTION, {
            useNewUrlParser: true,     <-- deprecated
            useUnifiedTopology: true,  <-- deprecated
            useCreateIndex: true,      <-- deprecated
            useFindAndModify: false    <-- deprecated 
        });*/

        console.log('Base de datos conectada');

    } catch (error) {
        console.log(error);
       throw new Error('Error a la hora de inicializar la base de datos'); 
    }
}

module.exports = { dbConnection}