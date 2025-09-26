const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");

// 🔹 Importar modelos para que Sequelize los registre
require("./models/Usuario");
require("./models/Invitacion");
require("./models/Confirmacion");
require("./models/MetodoEnvio");
require("./models/EstadoInvitacion");
require("./models/Eventos"); // 👈 Modelo de eventos

// 🔹 Cargar relaciones entre modelos
require("./models/associations");

// 🔹 Importar rutas
const authRoutes = require("./routes/auth.routes"); // 👈 Rutas de autenticación
const usuariosRoutes = require("./routes/usuarios.routes");
const invitacionesRoutes = require("./routes/invitaciones.routes");
const confirmacionesRoutes = require("./routes/confirmaciones.routes");
const metodosRoutes = require("./routes/metodos.routes");
const estadosRoutes = require("./routes/estados.routes");
const eventosRoutes = require("./routes/eventos.routes"); // 👈 Nombre correcto
const reportesRoutes = require("./routes/reportes.routes"); // 👈 Rutas de reportes

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Servir archivos estáticos desde el directorio temp (para códigos QR)
app.use('/temp', express.static('src/temp'));

// 🔹 Prefijo para las rutas principales (buena práctica)
app.use("/api/auth", authRoutes); // 👈 Rutas de autenticación
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/invitaciones", invitacionesRoutes);
app.use("/api/confirmaciones", confirmacionesRoutes);
app.use("/api/metodos", metodosRoutes);
app.use("/api/estados", estadosRoutes);
app.use("/api/eventos", eventosRoutes); // 👈 Ruta funcionando
app.use("/api/reportes", reportesRoutes); // 👈 Rutas de reportes

// 🔹 Verificar conexión a la base de datos
sequelize.authenticate()
    .then(() => console.log("✅ Conectado a MySQL"))
    .catch(err => console.error("❌ Error de conexión:", err));

// 🔹 Sincronizar modelos con la base de datos
sequelize.sync({ force: false }) 
    .then(() => console.log("✅ Modelos sincronizados"))
    .catch(err => console.error("❌ Error al sincronizar modelos:", err));

// 🔹 Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
