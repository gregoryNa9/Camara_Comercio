const { Sequelize } = require("sequelize");
require('dotenv').config();

// 🔹 Configuración usando variables de entorno
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || "administrativo_db", // Tu base de datos por defecto
    process.env.MYSQL_USER || "admin",
    process.env.MYSQL_PASSWORD || "password123",
    {
        host: process.env.MYSQL_HOST || "localhost",
        dialect: "mysql",
        port: process.env.MYSQL_PORT || 3306,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
);

module.exports = sequelize;
