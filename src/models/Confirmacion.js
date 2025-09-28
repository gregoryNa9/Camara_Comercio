const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Formulario = require("./Formulario");

const Confirmacion = sequelize.define(
    "Confirmacion",
    {
        id_confirmacion: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        id_formulario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Formulario, key: "id_formulario" }
        },
        fecha_confirmacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        acciones: { type: DataTypes.STRING(50), defaultValue: "Completado" },
    },
    { tableName: "confirmaciones", timestamps: false }
);

Formulario.hasOne(Confirmacion, { foreignKey: "id_formulario" });
Confirmacion.belongsTo(Formulario, { foreignKey: "id_formulario" });

module.exports = Confirmacion;
