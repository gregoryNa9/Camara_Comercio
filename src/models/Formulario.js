const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Formulario = sequelize.define(
  "Formulario",
  {
    id_formulario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    empresa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sector: {
      type: DataTypes.ENUM(
        "Productores / Agroindustria",
        "Industriales / Manufactureros",
        "Comerciantes / Distribuidores",
        "Importadores",
        "Exportadores",
        "Salud",
        "Servicios Empresariales",
        "Logística y Transporte",
        "Finanzas y Seguros",
        "Tecnología e Innovación",
        "Turístico",
        "Servicios",
        "Otro"
      ),
      allowNull: false,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "formulario", // 👈 tabla existente en tu BD
    timestamps: false,        // 👈 evita createdAt y updatedAt
  }
);

module.exports = Formulario;
