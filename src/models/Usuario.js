const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuario = sequelize.define("Usuario", {
    id_usuario: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cedula: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    correo: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    telefono: { type: DataTypes.STRING(20) },
    empresa: { type: DataTypes.STRING(100) },
    cargo: { type: DataTypes.STRING(100) },
    direccion: { type: DataTypes.STRING(150) },
    // 🔹 Campos para autenticación
    usuario: { type: DataTypes.STRING(50), allowNull: true, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: true },
    rol: { type: DataTypes.STRING(20), defaultValue: 'usuario' },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: "usuarios", timestamps: false });

module.exports = Usuario;
