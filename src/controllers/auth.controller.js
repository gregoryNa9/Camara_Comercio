const jwt = require("jsonwebtoken");

// Credenciales fijas para el sistema
const ADMIN_CREDENTIALS = {
    usuario: "admin",
    password: "admin123",
    nombre: "Administrador",
    rol: "admin"
};

// Login de usuario
exports.login = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        // Validar que se envíen los datos requeridos
        if (!usuario || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Usuario y contraseña son requeridos" 
            });
        }

        // Verificación simple con if
        if (usuario === ADMIN_CREDENTIALS.usuario && password === ADMIN_CREDENTIALS.password) {
            // Generar token JWT
            const token = jwt.sign(
                { 
                    id: 1, 
                    usuario: ADMIN_CREDENTIALS.usuario,
                    rol: ADMIN_CREDENTIALS.rol
                },
                process.env.JWT_SECRET || 'clave_secreta_por_defecto',
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            // Respuesta exitosa
            res.json({
                success: true,
                message: "Login exitoso",
                token: token,
                user: {
                    id: 1,
                    usuario: ADMIN_CREDENTIALS.usuario,
                    nombre: ADMIN_CREDENTIALS.nombre,
                    rol: ADMIN_CREDENTIALS.rol
                }
            });
        } else {
            return res.status(401).json({ 
                success: false, 
                message: "Credenciales incorrectas" 
            });
        }

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor" 
        });
    }
};

// Logout de usuario
exports.logout = async (req, res) => {
    try {
        // En una implementación más avanzada, podrías invalidar el token
        // Por ahora, simplemente confirmamos el logout
        res.json({
            success: true,
            message: "Logout exitoso"
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error al cerrar sesión" 
        });
    }
};

// Verificar token
exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Token no proporcionado" 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_por_defecto');
        
        res.json({
            success: true,
            user: decoded
        });
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: "Token inválido" 
        });
    }
};
