const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Confirmacion = sequelize.define("Confirmacion", {
    id_confirmacion: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_invitacion: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    correo: { type: DataTypes.STRING(100), allowNull: false },
    telefono: { type: DataTypes.STRING(20) },
    cargo: { type: DataTypes.STRING(100) },
    direccion: { type: DataTypes.STRING(150) },
    fecha_confirmacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: "confirmaciones", timestamps: false });

module.exports = Confirmacion;
