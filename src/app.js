const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");

// 🔹 Importar modelos para que Sequelize los registre
require("./models/Usuario");
require("./models/Invitacion");
require("./models/Formulario");    // 👈 Nuevo modelo agregado
require("./models/Confirmacion");
require("./models/MetodoEnvio");
require("./models/EstadoInvitacion");
require("./models/Eventos"); 

// 🔹 Cargar relaciones entre modelos
require("./models/associations");

// 🔹 Importar rutas
const authRoutes = require("./routes/auth.routes"); 
const usuariosRoutes = require("./routes/usuarios.routes");
const invitacionesRoutes = require("./routes/invitaciones.routes");
const confirmacionesRoutes = require("./routes/confirmaciones.routes");
const metodosRoutes = require("./routes/metodos.routes");
const estadosRoutes = require("./routes/estados.routes");
const eventosRoutes = require("./routes/eventos.routes"); 
const reportesRoutes = require("./routes/reportes.routes"); 

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Servir archivos estáticos desde el directorio temp (para códigos QR)
app.use('/temp', express.static('src/temp'));

// 🔹 Prefijo para las rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/invitaciones", invitacionesRoutes);
app.use("/api/confirmaciones", confirmacionesRoutes);
app.use("/api/metodos", metodosRoutes);
app.use("/api/estados", estadosRoutes);
app.use("/api/eventos", eventosRoutes);
app.use("/api/reportes", reportesRoutes);

// 🔹 Verificar conexión a la base de datos
sequelize.authenticate()
    .then(() => console.log("✅ Conectado a MySQL"))
    .catch(err => console.error("❌ Error de conexión:", err));

// 🔹 Sincronizar modelos con la base de datos (NO recrea tablas si force: false)
sequelize.sync({ force: false }) 
    .then(() => console.log("✅ Modelos sincronizados"))
    .catch(err => console.error("❌ Error al sincronizar modelos:", err));

// 🔹 Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
