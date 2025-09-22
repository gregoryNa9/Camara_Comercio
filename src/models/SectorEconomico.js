const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SectorEconomico = sequelize.define("SectorEconomico", {
    id_sector: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre_sector: { type: DataTypes.STRING(100), allowNull: false, unique: true },
}, { tableName: "sectores_economicos", timestamps: false });

module.exports = SectorEconomico;
