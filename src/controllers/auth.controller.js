const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

        // Buscar usuario en la base de datos
        const user = await Usuario.findOne({ 
            where: { 
                usuario: usuario 
            } 
        });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Credenciales incorrectas" 
            });
        }

        // Verificar contraseña (comparación directa para contraseñas en texto plano)
        const passwordMatch = password === user.password;
        
        if (!passwordMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Credenciales incorrectas" 
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: user.id_usuario, 
                usuario: user.usuario,
                rol: user.rol || 'usuario'
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
                id: user.id_usuario,
                usuario: user.usuario,
                nombre: user.nombre,
                apellido: user.apellido,
                rol: user.rol || 'usuario'
            }
        });

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
