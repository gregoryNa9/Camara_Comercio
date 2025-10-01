const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const Invitacion = require("../models/Invitacion");
const Usuario = require("../models/Usuario");
const Evento = require("../models/Eventos");
const EstadoInvitacion = require("../models/EstadoInvitacion");
const generateQR = require("../utils/generateQR"); // debe devolver { qrDataURL, filePath } o similar
const emailService = require("../services/emailService");
const whatsappService = require("../services/whatsappService");
const brevoService = require("../services/brevoService");

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
            estado_invitacion: invitacion.EstadoInvitacion?.nombre_estado || 'Sin estado',
            id_metodo_envio: invitacion.id_metodo_envio,
            numero_acompanantes: invitacion.numero_acompanantes || 0
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
            numero_acompanantes = 0,
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

        // Generar código alfanumérico único:
        // Reglas: 2 primeras letras del evento + 3 últimos números de la cédula + 1ra letra del primer nombre + 1ra letra del primer apellido + timestamp
        const nombreEvento = (evento.nombre_evento || "").toUpperCase();
        const pref = (nombreEvento.replace(/\s+/g, "").slice(0, 2) || "EV").toUpperCase();

        const cedulaOnlyDigits = String(cedula).replace(/\D/g, "");
        const last3Ced = cedulaOnlyDigits.slice(-3).padStart(3, "0");

        // Extraer primeras letras de nombre y apellido del campo usuario.nombre
        const nombreCompleto = (usuario.nombre || "").trim();
        const parts = nombreCompleto.split(/\s+/);
        const primeraLetraNombre = (parts[0] || "").charAt(0).toUpperCase() || "X";
        const primeraLetraApellido = (parts.length > 1 ? parts[parts.length - 1].charAt(0) : "").toUpperCase() || "X";

        // Generar código base
        let codigoBase = `${pref}${last3Ced}${primeraLetraNombre}${primeraLetraApellido}`;
        
        // Verificar si el código ya existe y generar uno único
        let codigo_unico = codigoBase;
        let contador = 1;
        
        while (true) {
            const existeCodigo = await Invitacion.findOne({ where: { codigo_unico } });
            if (!existeCodigo) {
                break; // Código único encontrado
            }
            // Si existe, agregar un sufijo numérico
            codigo_unico = `${codigoBase}${contador.toString().padStart(2, '0')}`;
            contador++;
            
            // Prevenir bucle infinito
            if (contador > 99) {
                // Si llegamos a 99, usar timestamp como último recurso
                const timestamp = Date.now().toString().slice(-4);
                codigo_unico = `${codigoBase}${timestamp}`;
                break;
            }
        }

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
            numero_acompanantes: parseInt(numero_acompanantes) || 0,
        });

        // Preparar datos para los servicios de envío
        const datosInvitacion = {
            nombre: parts[0] || usuario.nombre,
            evento_nombre: evento.nombre_evento,
            fecha_evento: evento.fecha,
            lugar_evento: evento.lugar,
            codigo_unico: codigo_unico,
            numero_acompanantes: parseInt(numero_acompanantes) || 0,
            qr_image: qrDataURL,
            confirmacion_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirmar/${codigo_unico}`,
            unsubscribe_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe/${codigo_unico}`,
            attachments: qrFilePath ? [qrFilePath] : []
        };

        // Enviar correo (si corresponde) con manejo de errores y reintentos
        let emailEnviado = false;
        if (Number(id_metodo_envio) === 1 || Number(id_metodo_envio) === 3) {
            try {
                console.log(`📧 Enviando email a: ${usuario.correo}`);
                // Usar Brevo para envío de formulario (Etapa 1)
                const emailResult = await brevoService.sendFormularioRegistro(usuario.correo, datosInvitacion);
                emailEnviado = emailResult.success;
                if (emailEnviado) {
                    console.log("✅ Email enviado correctamente con Brevo");
                } else {
                    console.error("❌ Error enviando email con Brevo:", emailResult.error);
                }
            } catch (emailError) {
                console.error("❌ Error enviando email:", emailError);
                // No fallar la operación completa si el email falla
            }
        }

        // Enviar WhatsApp (si corresponde) con manejo de errores y reintentos
        let whatsappEnviado = false;
        if (Number(id_metodo_envio) === 2 || Number(id_metodo_envio) === 3) {
            try {
                console.log(`📱 Enviando WhatsApp a: ${usuario.telefono}`);
                // Usar Brevo para envío de formulario (Etapa 1)
                const whatsappResult = await brevoService.sendFormularioWhatsApp(usuario.telefono, datosInvitacion);
                whatsappEnviado = whatsappResult.success;
                if (whatsappEnviado) {
                    console.log("✅ WhatsApp enviado correctamente con Brevo");
                } else {
                    console.error("❌ Error enviando WhatsApp con Brevo:", whatsappResult.error);
                }
            } catch (whatsappError) {
                console.error("❌ Error enviando WhatsApp:", whatsappError);
                // No fallar la operación completa si WhatsApp falla
            }
        }

        // Preparar respuesta con estado de envíos
        const respuesta = {
            message: "Invitación creada correctamente",
            invitacion: {
                id_invitacion: invitacion.id_invitacion,
                codigo_unico: invitacion.codigo_unico,
                fecha_envio: invitacion.fecha_envio
            },
            envios: {
                email: {
                    enviado: emailEnviado,
                    destinatario: usuario.correo
                },
                whatsapp: {
                    enviado: whatsappEnviado,
                    destinatario: usuario.telefono
                }
            }
        };

        // Determinar mensaje final basado en el éxito de los envíos
        if (emailEnviado && whatsappEnviado) {
            respuesta.message = "Invitación enviada correctamente por email y WhatsApp";
        } else if (emailEnviado) {
            respuesta.message = "Invitación enviada correctamente por email";
        } else if (whatsappEnviado) {
            respuesta.message = "Invitación enviada correctamente por WhatsApp";
        } else {
            respuesta.message = "Invitación creada pero hubo problemas con los envíos";
        }

        return res.status(201).json(respuesta);
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
                },
                {
                    model: EstadoInvitacion,
                    as: 'EstadoInvitacion',
                    attributes: ['id_estado', 'nombre_estado']
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
            estado_invitacion: invitacion.EstadoInvitacion?.nombre_estado || 'Sin estado',
            id_metodo_envio: invitacion.id_metodo_envio,
            numero_acompanantes: invitacion.numero_acompanantes || 0
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

/**
 * POST /api/invitaciones/enviar-formulario
 * ETAPA 1: Enviar formulario de registro usando Brevo
 */
exports.enviarFormularioBrevo = async (req, res) => {
    try {
        const { invitacionIds, metodoEnvio } = req.body; // 'email', 'whatsapp', o 'ambos'
        
        if (!invitacionIds || !Array.isArray(invitacionIds) || invitacionIds.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Se requiere al menos una invitación" 
            });
        }

        const resultados = [];
        
        for (const invitacionId of invitacionIds) {
            try {
                // Obtener datos de la invitación
                const invitacion = await Invitacion.findByPk(invitacionId, {
                    include: [
                        { model: Usuario, as: 'Usuario' },
                        { model: Evento, as: 'Evento' }
                    ]
                });

                if (!invitacion) {
                    resultados.push({
                        id: invitacionId,
                        success: false,
                        error: 'Invitación no encontrada'
                    });
                    continue;
                }

                // Preparar datos para el formulario
                const datosInvitacion = {
                    nombre: invitacion.Usuario.nombre,
                    evento_nombre: invitacion.Evento.nombre_evento,
                    fecha_evento: invitacion.Evento.fecha,
                    lugar_evento: invitacion.Evento.lugar,
                    codigo_unico: invitacion.codigo_unico,
                    formulario_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/formulario-publico/?codigo=${invitacion.codigo_unico}`
                };

                const resultadoEnvio = {
                    id: invitacionId,
                    email: null,
                    whatsapp: null
                };

                // Enviar email formulario si se solicita
                if (metodoEnvio === 'email' || metodoEnvio === 'ambos') {
                    if (invitacion.Usuario.correo) {
                        const emailResult = await brevoService.sendFormularioRegistro(
                            invitacion.Usuario.correo, 
                            datosInvitacion
                        );
                        resultadoEnvio.email = emailResult;
                    } else {
                        resultadoEnvio.email = { success: false, error: 'No hay email registrado' };
                    }
                }

                // Enviar WhatsApp formulario si se solicita
                if (metodoEnvio === 'whatsapp' || metodoEnvio === 'ambos') {
                    if (invitacion.Usuario.telefono) {
                        const whatsappResult = await brevoService.sendFormularioWhatsApp(
                            invitacion.Usuario.telefono, 
                            datosInvitacion
                        );
                        resultadoEnvio.whatsapp = whatsappResult;
                    } else {
                        resultadoEnvio.whatsapp = { success: false, error: 'No hay teléfono registrado' };
                    }
                }

                // Actualizar estado de la invitación (formulario enviado)
                await invitacion.update({
                    fecha_envio: new Date(),
                    id_metodo_envio: metodoEnvio === 'email' ? 1 : metodoEnvio === 'whatsapp' ? 2 : 3,
                    id_estado: 2 // Estado: Formulario enviado
                });

                resultados.push(resultadoEnvio);

            } catch (error) {
                console.error(`Error procesando invitación ${invitacionId}:`, error);
                resultados.push({
                    id: invitacionId,
                    success: false,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Formularios enviados a ${invitacionIds.length} invitaciones`,
            etapa: 1,
            resultados: resultados
        });

    } catch (error) {
        console.error("Error en enviarFormularioBrevo:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor",
            error: error.message 
        });
    }
};

/**
 * GET /api/invitaciones/validar-codigo/:codigo
 * Validar código de invitación y obtener datos del evento
 */
exports.validarCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;
        
        if (!codigo) {
            return res.status(400).json({ 
                success: false, 
                message: "Código de invitación requerido" 
            });
        }

        // Buscar invitación por código único
        const invitacion = await Invitacion.findOne({
            where: { codigo_unico: codigo },
            include: [
                { 
                    model: Evento, 
                    as: 'Evento',
                    attributes: ['id_evento', 'nombre_evento', 'categoria', 'fecha', 'lugar', 'hora_inicio', 'hora_fin']
                }
            ]
        });

        if (!invitacion) {
            return res.status(404).json({ 
                success: false, 
                message: "Código de invitación no válido o no encontrado" 
            });
        }

        // Verificar si ya existe confirmación para esta invitación
        const Confirmacion = require("../models/Confirmacion");
        const confirmacionExistente = await Confirmacion.findOne({
            where: { id_invitacion: invitacion.id_invitacion }
        });

        if (confirmacionExistente) {
            return res.status(400).json({ 
                success: false, 
                message: "Ya existe una confirmación para esta invitación",
                yaConfirmado: true
            });
        }

        // Devolver datos del evento para el formulario
                res.json({
                    success: true,
                    message: "Código válido",
                    invitacion: {
                        id_invitacion: invitacion.id_invitacion,
                        codigo_unico: invitacion.codigo_unico,
                        numero_acompanantes: invitacion.numero_acompanantes || 0,
                        evento: {
                            id_evento: invitacion.Evento.id_evento,
                            nombre_evento: invitacion.Evento.nombre_evento,
                            categoria: invitacion.Evento.categoria,
                            fecha: invitacion.Evento.fecha,
                            lugar: invitacion.Evento.lugar,
                            hora_inicio: invitacion.Evento.hora_inicio,
                            hora_fin: invitacion.Evento.hora_fin
                        }
                    }
                });

    } catch (error) {
        console.error("Error en validarCodigo:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor",
            error: error.message 
        });
    }
};

/**
 * POST /api/invitaciones/confirmar/:codigo
 * Crear confirmación usando código de invitación
 */
exports.confirmarInvitacion = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { nombre, correo, telefono, cargo, direccion, acompanantes = [] } = req.body;
        
        if (!codigo || !nombre || !correo) {
            return res.status(400).json({ 
                success: false, 
                message: "Código, nombre y correo son requeridos" 
            });
        }

        // Buscar invitación por código único
        const invitacion = await Invitacion.findOne({
            where: { codigo_unico: codigo },
            include: [{ model: Evento, as: 'Evento' }]
        });

        if (!invitacion) {
            return res.status(404).json({ 
                success: false, 
                message: "Código de invitación no válido" 
            });
        }

        // Verificar si ya existe confirmación
        const Confirmacion = require("../models/Confirmacion");
        const confirmacionExistente = await Confirmacion.findOne({
            where: { id_invitacion: invitacion.id_invitacion }
        });

        if (confirmacionExistente) {
            return res.status(400).json({ 
                success: false, 
                message: "Ya existe una confirmación para esta invitación" 
            });
        }

        // Crear confirmación
        const confirmacion = await Confirmacion.create({
            id_invitacion: invitacion.id_invitacion,
            nombre,
            correo,
            telefono: telefono || null,
            cargo: cargo || null,
            direccion: direccion || null,
            fecha_confirmacion: new Date()
        });

        // Actualizar estado de la invitación
        await invitacion.update({
            id_estado: 4 // Estado: Confirmado
        });

        // Crear confirmaciones para acompañantes si existen
        if (acompanantes && acompanantes.length > 0) {
            const generateAcompananteCodes = require("../utils/generateAcompananteCode");
            
            for (let i = 0; i < acompanantes.length; i++) {
                const acompanante = acompanantes[i];
                
                // Generar códigos para el acompañante
                const codes = await generateAcompananteCodes.generateAcompananteCodes(
                    invitacion.codigo_unico, 
                    i + 1
                );
                
                // Crear confirmación para el acompañante
                const confirmacionAcompanante = await Confirmacion.create({
                    id_invitacion: invitacion.id_invitacion,
                    nombre: acompanante.nombre,
                    correo: acompanante.correo || '',
                    telefono: acompanante.telefono || null,
                    cargo: acompanante.cargo || null,
                    direccion: null,
                    fecha_confirmacion: new Date(),
                    es_acompanante: true,
                    id_usuario_principal: invitacion.id_usuario,
                    tipo_participante: 'Acompañante',
                    codigo_participante: codes.codigo_participante,
                    qr_participante: codes.qr_participante,
                    id_confirmacion_padre: confirmacion.id_confirmacion
                });
                
                console.log(`✅ Acompañante ${i + 1} registrado con código: ${codes.codigo_participante}`);
                
                // Enviar email al acompañante si tiene correo
                if (acompanante.correo) {
                    try {
                        const datosAcompanante = {
                            nombre: acompanante.nombre,
                            evento_nombre: invitacion.Evento.nombre_evento,
                            fecha_evento: invitacion.Evento.fecha,
                            lugar_evento: invitacion.Evento.lugar,
                            codigo_unico: codes.codigo_participante,
                            qr_url: codes.qr_participante,
                            invitado_principal: nombre,
                            confirmacion_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirmar/${invitacion.codigo_unico}`
                        };
                        
                        const emailAcompanante = await brevoService.sendCodigosAcompanante(acompanante.correo, datosAcompanante);
                        if (emailAcompanante.success) {
                            console.log(`✅ Email enviado a acompañante: ${acompanante.nombre} (${acompanante.correo})`);
                        }
                    } catch (emailError) {
                        console.error(`❌ Error enviando email a acompañante ${acompanante.nombre}:`, emailError);
                    }
                }
            }
            
            console.log(`✅ ${acompanantes.length} acompañantes registrados como confirmaciones`);
        }

        // Preparar datos para enviar códigos de confirmación
        const datosInvitacion = {
            nombre: nombre,
            evento_nombre: invitacion.Evento.nombre_evento,
            fecha_evento: invitacion.Evento.fecha,
            lugar_evento: invitacion.Evento.lugar,
            codigo_unico: invitacion.codigo_unico,
            confirmacion_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirmar/${invitacion.codigo_unico}`
        };

        // Enviar códigos de confirmación por email
        let emailEnviado = false;
        try {
            const emailResult = await brevoService.sendCodigosInvitacion(correo, datosInvitacion);
            emailEnviado = emailResult.success;
            if (emailEnviado) {
                console.log("✅ Códigos de confirmación enviados por email");
            }
        } catch (emailError) {
            console.error("❌ Error enviando códigos por email:", emailError);
        }

        res.status(201).json({
            success: true,
            message: "Confirmación registrada exitosamente",
            confirmacion: {
                id_confirmacion: confirmacion.id_confirmacion,
                nombre: confirmacion.nombre,
                correo: confirmacion.correo,
                fecha_confirmacion: confirmacion.fecha_confirmacion,
                acompanantes: acompanantes || []
            },
            evento: {
                nombre_evento: invitacion.Evento.nombre_evento,
                fecha: invitacion.Evento.fecha,
                lugar: invitacion.Evento.lugar
            },
            email_enviado: emailEnviado
        });

    } catch (error) {
        console.error("Error en confirmarInvitacion:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor",
            error: error.message 
        });
    }
};

/**
 * POST /api/invitaciones/enviar-codigos
 * ETAPA 2: Enviar códigos QR y alfanuméricos usando Brevo
 */
exports.enviarCodigosBrevo = async (req, res) => {
    try {
        const { invitacionIds, metodoEnvio } = req.body; // 'email', 'whatsapp', o 'ambos'
        
        if (!invitacionIds || !Array.isArray(invitacionIds) || invitacionIds.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Se requiere al menos una invitación" 
            });
        }

        const resultados = [];
        
        for (const invitacionId of invitacionIds) {
            try {
                // Obtener datos de la invitación
                const invitacion = await Invitacion.findByPk(invitacionId, {
                    include: [
                        { model: Usuario, as: 'Usuario' },
                        { model: Evento, as: 'Evento' }
                    ]
                });

                if (!invitacion) {
                    resultados.push({
                        id: invitacionId,
                        success: false,
                        error: 'Invitación no encontrada'
                    });
                    continue;
                }

                // Generar QR
                const qrResult = await generateQR(invitacion.codigo_unico);
                
                // Preparar datos para el envío de códigos
                const datosInvitacion = {
                    nombre: invitacion.Usuario.nombre,
                    evento_nombre: invitacion.Evento.nombre_evento,
                    fecha_evento: invitacion.Evento.fecha,
                    lugar_evento: invitacion.Evento.lugar,
                    codigo_unico: invitacion.codigo_unico,
                    qr_image: qrResult.qrDataURL, // Base64 para adjunto
                    confirmacion_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirmar/${invitacion.codigo_unico}`
                };

                const resultadoEnvio = {
                    id: invitacionId,
                    email: null,
                    whatsapp: null
                };

                // Enviar email códigos si se solicita
                if (metodoEnvio === 'email' || metodoEnvio === 'ambos') {
                    if (invitacion.Usuario.correo) {
                        const emailResult = await brevoService.sendCodigosInvitacion(
                            invitacion.Usuario.correo, 
                            datosInvitacion
                        );
                        resultadoEnvio.email = emailResult;
                    } else {
                        resultadoEnvio.email = { success: false, error: 'No hay email registrado' };
                    }
                }

                // Enviar WhatsApp códigos si se solicita
                if (metodoEnvio === 'whatsapp' || metodoEnvio === 'ambos') {
                    if (invitacion.Usuario.telefono) {
                        const whatsappResult = await brevoService.sendCodigosWhatsApp(
                            invitacion.Usuario.telefono, 
                            datosInvitacion
                        );
                        resultadoEnvio.whatsapp = whatsappResult;
                    } else {
                        resultadoEnvio.whatsapp = { success: false, error: 'No hay teléfono registrado' };
                    }
                }

                // Actualizar estado de la invitación (códigos enviados)
                await invitacion.update({
                    fecha_envio: new Date(),
                    id_metodo_envio: metodoEnvio === 'email' ? 1 : metodoEnvio === 'whatsapp' ? 2 : 3,
                    id_estado: 3 // Estado: Códigos enviados
                });

                resultados.push(resultadoEnvio);

            } catch (error) {
                console.error(`Error procesando invitación ${invitacionId}:`, error);
                resultados.push({
                    id: invitacionId,
                    success: false,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Códigos enviados a ${invitacionIds.length} invitaciones`,
            etapa: 2,
            resultados: resultados
        });

    } catch (error) {
        console.error("Error en enviarCodigosBrevo:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor",
            error: error.message 
        });
    }
};