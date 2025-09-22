const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

<<<<<<< HEAD
const Invitacion = sequelize.define("Invitacion", {
    id_invitacion: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_usuario: { type: DataTypes.INTEGER, allowNull: false },
    codigo_unico: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    qr_url: { type: DataTypes.STRING(255) },
    fecha_envio: { type: DataTypes.DATE },
    id_estado: { type: DataTypes.INTEGER, allowNull: false },
    id_metodo_envio: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "invitaciones", timestamps: false });
=======
const Invitacion = sequelize.define(
    "Invitacion",
    {
        id_invitacion: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_evento: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        codigo_unico: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        qr_url: {
            type: DataTypes.STRING(255),
        },
        imagen: {
            type: DataTypes.STRING(255), // ruta al archivo subido
            allowNull: true,
        },
        fecha_envio: {
            type: DataTypes.DATE,
        },
        id_estado: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_metodo_envio: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "invitaciones",
        timestamps: false,
    }
);
>>>>>>> 73fe9df (Conexión con la BDD)

module.exports = Invitacion;
