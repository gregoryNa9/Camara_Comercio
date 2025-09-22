const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuario = sequelize.define("Usuario", {
    id_usuario: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cedula: { type: DataTypes.STRING(20), allowNull: false },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    correo: { type: DataTypes.STRING(100), allowNull: false },
    telefono: { type: DataTypes.STRING(20) },
    empresa: { type: DataTypes.STRING(100) },
    cargo: { type: DataTypes.STRING(100) },
    direccion: { type: DataTypes.STRING(150) },
    id_sector: { type: DataTypes.INTEGER },
}, { tableName: "usuarios", timestamps: false });

module.exports = Usuario;
