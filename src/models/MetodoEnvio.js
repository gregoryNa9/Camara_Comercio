const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MetodoEnvio = sequelize.define("MetodoEnvio", {
    id_metodo_envio: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre_metodo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
}, { tableName: "metodos_envio", timestamps: false });

module.exports = MetodoEnvio;
