const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Evento = sequelize.define("Evento", {
    id_evento: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre_evento: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tema_evento: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tema_conferencia: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    lugar: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    hora_fin: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    codigo_vestimenta: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    organizado_por: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    estado_evento: {
        type: DataTypes.STRING, // si luego tienes tabla de estados, se hace relación
        allowNull: false,
    },
}, {
    tableName: "eventos",
    timestamps: false,
});

module.exports = Evento;
