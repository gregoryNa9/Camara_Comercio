const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const Invitacion = require("../models/Invitacion");
const Usuario = require("../models/Usuario");
const Evento = require("../models/Eventos");
const generateQR = require("../utils/generateQR"); // debe devolver { qrDataURL, filePath } o similar
const sendEmail = require("../utils/sendEmail");
const sendWhatsApp = require("../utils/whatsappApi");

/**
 * GET /api/invitaciones
 */
exports.getAll = async (req, res) => {
    try {
        const data = await Invitacion.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'Usuario',
                    attributes: ['id_usuario', 'cedula', 'nombre', 'correo', 'telefono', 'empresa', 'cargo']
                },
                {
                    model: Evento,
                    as: 'Evento',
                    attributes: ['id_evento', 'nombre_evento', 'categoria', 'fecha', 'lugar']
                }
            ]
        });
        
        // Mapear los datos para el frontend
        const invitacionesMapeadas = data.map(invitacion => ({
            id_invitacion: invitacion.id_invitacion,
            cedula: invitacion.Usuario?.cedula || '',
            nombre: invitacion.Usuario?.nombre || '',
            correo: invitacion.Usuario?.correo || '',
            telefono: invitacion.Usuario?.telefono || '',
            empresa: invitacion.Usuario?.empresa || '',
            cargo: invitacion.Usuario?.cargo || '',
            evento: invitacion.Evento?.nombre_evento || '',
            evento_id: invitacion.Evento?.id_evento || '',
            categoria: invitacion.Evento?.categoria || '',
            fecha_evento: invitacion.Evento?.fecha || '',
            lugar: invitacion.Evento?.lugar || '',
            codigo_unico: invitacion.codigo_unico,
            qr_url: invitacion.qr_url,
            imagen: invitacion.imagen,
            fecha_envio: invitacion.fecha_envio,
            id_estado: invitacion.id_estado,
            id_metodo_envio: invitacion.id_metodo_envio
        }));
        
        res.json(invitacionesMapeadas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener invitaciones", error: error.message });
    }
};

/**
 * POST /api/invitaciones
 * - recibe multipart/form-data:
 *    - cedula, nombre, correo, telefono (o solo cedula para buscar usuario existente)
 *    - id_evento
 *    - id_metodo_envio (1=correo,2=whatsapp,3=ambos por ejemplo)
 *    - id_estado
 *    - file: imagen (opcional) -> se guarda y se referencia en Invitacion.imagen
 */
exports.create = async (req, res) => {
    try {
        // multer coloca el file en req.file
        const file = req.file; // optional
        const {
            cedula,
            nombre,
            correo,
            telefono,
            id_evento,
            id_metodo_envio = 3,
            id_estado = 1,
        } = req.body;

        if (!cedula || !id_evento) {
            return res.status(400).json({ message: "cedula e id_evento son requeridos" });
        }

        // Buscar evento (necesario para generar el prefijo de código)
        const evento = await Evento.findOne({ where: { id_evento } });
        if (!evento) return res.status(400).json({ message: "Evento no encontrado" });

        // Buscar usuario por cédula; si no existe, crear si vienen datos suficientes
        let usuario = await Usuario.findOne({ where: { cedula } });
        if (!usuario) {
            if (!nombre || !correo) {
                return res.status(400).json({
                    message: "Usuario no existe: envía nombre y correo para crear nuevo usuario",
                });
            }
            usuario = await Usuario.create({
                cedula,
                nombre,
                correo,
                telefono: telefono || null,
            });
        }

        // Evitar duplicados: si ya existe invitación para el usuario y evento
        const existe = await Invitacion.findOne({
            where: { id_usuario: usuario.id_usuario, id_evento },
        });
        if (existe) {
            return res.status(400).json({ message: "Este usuario ya tiene una invitación para este evento" });
        }

        // Generar código alfanumérico:
        // Reglas: 2 primeras letras del evento + 3 últimos números de la cédula + 1ra letra del primer nombre + 1ra letra del primer apellido
        const nombreEvento = (evento.nombre_evento || "").toUpperCase();
        const pref = (nombreEvento.replace(/\s+/g, "").slice(0, 2) || "EV").toUpperCase();

        const cedulaOnlyDigits = String(cedula).replace(/\D/g, "");
        const last3Ced = cedulaOnlyDigits.slice(-3).padStart(3, "0");

        // Extraer primeras letras de nombre y apellido del campo usuario.nombre
        const nombreCompleto = (usuario.nombre || "").trim();
        const parts = nombreCompleto.split(/\s+/);
        const primeraLetraNombre = (parts[0] || "").charAt(0).toUpperCase() || "X";
        const primeraLetraApellido = (parts.length > 1 ? parts[parts.length - 1].charAt(0) : "").toUpperCase() || "X";

        const codigo_unico = `${pref}${last3Ced}${primeraLetraNombre}${primeraLetraApellido}`;

        // Generar QR con el código alfanumérico único
        const { qrDataURL, filePath: qrFilePath } = await generateQR(codigo_unico, true);
        // qrDataURL => base64 data url usable en emails; qrFilePath => path en fs si tu util lo crea

        // Si se subió una imagen, guardamos la ruta relativa
        let imagenRuta = null;
        if (file) {
            // ya con multer el archivo está en uploads/ por ejemplo
            imagenRuta = file.filename || file.path; // ajusta según tu configuración de multer
        }

        // Guardar invitación - solo guardamos la ruta del archivo QR, no el base64 completo
        const invitacion = await Invitacion.create({
            id_usuario: usuario.id_usuario,
            id_evento,
            codigo_unico,
            qr_url: qrFilePath, // Guardamos solo la ruta del archivo, no el base64
            imagen: imagenRuta,
            fecha_envio: new Date(),
            id_estado,
            id_metodo_envio,
        });

        // Preparar mensajes dinámicos
        const emailBody = `
        <p>Hola ${parts[0] || usuario.nombre},</p>
        <p>Has sido invitado al evento <b>${evento.nombre_evento}</b>.</p>
        <p>Tu código: <b>${codigo_unico}</b></p>
        <p>Presenta el siguiente QR en la entrada:</p>
        <img src="${qrDataURL}" alt="QR">
        `;

        const whatsappText = `Hola ${parts[0] || usuario.nombre}, tu código para ${evento.nombre_evento} es: ${codigo_unico}.`;

        // Enviar correo (si corresponde)
        if (Number(id_metodo_envio) === 1 || Number(id_metodo_envio) === 3) {
            // si sendEmail acepta (to, subject, html, attachmentsPath)
            await sendEmail(usuario.correo, `Invitación - ${evento.nombre_evento}`, emailBody, qrFilePath ? [qrFilePath] : []);
        }

        // Enviar WhatsApp (si corresponde)
        if (Number(id_metodo_envio) === 2 || Number(id_metodo_envio) === 3) {
            // sendWhatsApp(phone, message, mediaUrl)
            await sendWhatsApp(usuario.telefono, whatsappText, qrDataURL);
        }

        return res.status(201).json({ message: "Invitación enviada correctamente", invitacion });
    } catch (error) {
        console.error("Error en create invitacion:", error);
        return res.status(500).json({ message: "Error al crear invitación", error: error.message });
    }
};

/**
 * PUT /api/invitaciones/:id
 */
exports.update = async (req, res) => {
    try {
        await Invitacion.update(req.body, { where: { id_invitacion: req.params.id } });
        res.json({ message: "Invitación actualizada" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Error al actualizar invitación", error: error.message });
    }
};

/**
 * GET /api/invitaciones/usuario/:id
 * Obtener invitaciones de un usuario específico
 */
exports.getByUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        const data = await Invitacion.findAll({
            where: { id_usuario: id },
            include: [
                {
                    model: Usuario,
                    as: 'Usuario',
                    attributes: ['id_usuario', 'cedula', 'nombre', 'correo', 'telefono', 'empresa', 'cargo']
                },
                {
                    model: Evento,
                    as: 'Evento',
                    attributes: ['id_evento', 'nombre_evento', 'categoria', 'fecha', 'lugar']
                }
            ]
        });
        
        // Mapear los datos para el frontend
        const invitacionesMapeadas = data.map(invitacion => ({
            id_invitacion: invitacion.id_invitacion,
            cedula: invitacion.Usuario?.cedula || '',
            nombre: invitacion.Usuario?.nombre || '',
            correo: invitacion.Usuario?.correo || '',
            telefono: invitacion.Usuario?.telefono || '',
            empresa: invitacion.Usuario?.empresa || '',
            cargo: invitacion.Usuario?.cargo || '',
            evento: invitacion.Evento?.nombre_evento || '',
            evento_id: invitacion.Evento?.id_evento || '',
            categoria: invitacion.Evento?.categoria || '',
            fecha_evento: invitacion.Evento?.fecha || '',
            lugar: invitacion.Evento?.lugar || '',
            codigo_unico: invitacion.codigo_unico,
            qr_url: invitacion.qr_url,
            imagen: invitacion.imagen,
            fecha_envio: invitacion.fecha_envio,
            id_estado: invitacion.id_estado,
            id_metodo_envio: invitacion.id_metodo_envio
        }));
        
        res.json(invitacionesMapeadas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener invitaciones del usuario", error: error.message });
    }
};

/**
 * DELETE /api/invitaciones/:id
 */
exports.delete = async (req, res) => {
    try {
        await Invitacion.destroy({ where: { id_invitacion: req.params.id } });
        res.json({ message: "Invitación eliminada" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Error al eliminar invitación", error: error.message });
    }
};