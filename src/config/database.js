const { Sequelize } = require("sequelize");

<<<<<<< HEAD
const sequelize = new Sequelize("mecanica_db", "admin", "password123", {
    host: "localhost",
    dialect: "mysql",
});

module.exports = sequelize;
=======
const sequelize = new Sequelize("formulario_db", "admin", "admin123", {
    host: "127.0.0.1",
    dialect: "mysql",
    port: 3308,
    logging: false,
});

module.exports = sequelize;
>>>>>>> 73fe9df (Conexión con la BDD)
