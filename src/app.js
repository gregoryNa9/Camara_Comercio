const express = require("express");
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/database");

// 🔹 Importar modelos para que Sequelize los registre
require("./models/Usuario");
require("./models/Invitacion");
require("./models/Confirmacion");
require("./models/MetodoEnvio");
require("./models/EstadoInvitacion");
require("./models/Eventos"); // 👈 Modelo de eventos
require("./models/Acompanante"); // 👈 Modelo de acompañantes

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
const acompanantesRoutes = require("./routes/acompanantes.routes"); // 👈 Rutas de acompañantes

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Servir archivos estáticos desde el directorio temp (para códigos QR)
app.use('/temp', express.static('src/temp'));

// 🔹 Servir formulario público
app.use('/formulario-publico', express.static('formulario-publico'));

// 🔹 Servir el frontend compilado (React)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// 🔹 Prefijo para las rutas principales (buena práctica)
app.use("/api/auth", authRoutes); // 👈 Rutas de autenticación
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/invitaciones", invitacionesRoutes);
app.use("/api/confirmaciones", confirmacionesRoutes);
app.use("/api/metodos", metodosRoutes);
app.use("/api/estados", estadosRoutes);
app.use("/api/eventos", eventosRoutes); // 👈 Ruta funcionando
app.use("/api/reportes", reportesRoutes); // 👈 Rutas de reportes
app.use("/api/acompanantes", acompanantesRoutes); // 👈 Rutas de acompañantes

// 🔹 Catch-all para SPA: devolver index.html para rutas no API
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/temp') || req.path.startsWith('/formulario-publico')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

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
