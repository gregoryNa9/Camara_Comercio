const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Acompanante = sequelize.define("Acompanante", {
    id_acompanante: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_confirmacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    cedula: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    correo: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    cargo: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    empresa: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "acompanantes",
    timestamps: false,
});

module.exports = Acompanante;
