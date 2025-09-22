const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EstadoInvitacion = sequelize.define("EstadoInvitacion", {
    id_estado: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre_estado: { type: DataTypes.STRING(50), allowNull: false, unique: true },
}, { tableName: "estados_invitaciones", timestamps: false });

module.exports = EstadoInvitacion;
