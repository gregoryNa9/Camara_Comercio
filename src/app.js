const express = require("express");
<<<<<<< HEAD
const sequelize = require("./config/database");

=======
const cors = require("cors");
const sequelize = require("./config/database");

// 🔹 Importar modelos para que Sequelize los registre
require("./models/Usuario");
require("./models/Invitacion");
require("./models/Confirmacion");
require("./models/MetodoEnvio");
require("./models/EstadoInvitacion");
require("./models/SectorEconomico");
require("./models/Eventos"); // 👈 Modelo de eventos

// 🔹 Importar rutas
>>>>>>> 73fe9df (Conexión con la BDD)
const usuariosRoutes = require("./routes/usuarios.routes");
const invitacionesRoutes = require("./routes/invitaciones.routes");
const confirmacionesRoutes = require("./routes/confirmaciones.routes");
const metodosRoutes = require("./routes/metodos.routes");
const estadosRoutes = require("./routes/estados.routes");
const sectoresRoutes = require("./routes/sectores.routes");
<<<<<<< HEAD

const app = express();
app.use(express.json());

// Rutas
app.use("/usuarios", usuariosRoutes);
app.use("/invitaciones", invitacionesRoutes);
app.use("/confirmaciones", confirmacionesRoutes);
app.use("/metodos", metodosRoutes);
app.use("/estados", estadosRoutes);
app.use("/sectores", sectoresRoutes);

// Sincronizar modelos con DB
sequelize.sync()
    .then(() => console.log("Base de datos sincronizada"))
    .catch(err => console.error("Error DB:", err));

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
=======
const eventosRoutes = require("./routes/eventos.routes"); // 👈 Nombre correcto

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Prefijo para las rutas principales (buena práctica)
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/invitaciones", invitacionesRoutes);
app.use("/api/confirmaciones", confirmacionesRoutes);
app.use("/api/metodos", metodosRoutes);
app.use("/api/estados", estadosRoutes);
app.use("/api/sectores", sectoresRoutes);
app.use("/api/eventos", eventosRoutes); // 👈 Ruta funcionando

// 🔹 Verificar conexión a la base de datos
sequelize.authenticate()
    .then(() => console.log("✅ Conectado a MySQL"))
    .catch(err => console.error("❌ Error de conexión:", err));

// 🔹 Sincronizar modelos con la base de datos
sequelize.sync({ alter: true }) 
    .then(() => console.log("✅ Modelos sincronizados"))
    .catch(err => console.error("❌ Error al sincronizar modelos:", err));

// 🔹 Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
>>>>>>> 73fe9df (Conexión con la BDD)
});
