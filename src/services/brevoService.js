const axios = require('axios');
const integrations = require('../config/integrations');

class BrevoService {
    constructor() {
        this.apiKey = process.env.BREVO_API_KEY;
        this.baseUrl = 'https://api.brevo.com/v3';
        
        // Configurar headers para todas las peticiones
        this.headers = {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * ETAPA 1: Enviar formulario de registro/confirmación
     */
    async sendFormularioRegistro(destinatario, datosInvitacion) {
        try {
            const template = this.generateFormularioTemplate(datosInvitacion);
            
            const emailData = {
                sender: {
                    name: process.env.BREVO_SENDER_NAME || "Cámara de Comercio",
                    email: process.env.BREVO_SENDER_EMAIL || "noreply@camaracomercio.com"
                },
                to: [{
                    email: destinatario,
                    name: datosInvitacion.nombre
                }],
                subject: template.subject,
                htmlContent: template.html
            };

            const response = await axios.post(`${this.baseUrl}/smtp/email`, emailData, {
                headers: this.headers
            });

            console.log('✅ Formulario de registro enviado:', response.data.messageId);
            return { success: true, messageId: response.data.messageId, etapa: 1 };
        } catch (error) {
            console.error('❌ Error enviando formulario:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    /**
     * ETAPA 2: Enviar códigos QR y alfanuméricos
     */
    async sendCodigosInvitacion(destinatario, datosInvitacion) {
        try {
            const template = this.generateCodigosTemplate(datosInvitacion);
            
            const emailData = {
                sender: {
                    name: process.env.BREVO_SENDER_NAME || "Cámara de Comercio",
                    email: process.env.BREVO_SENDER_EMAIL || "noreply@camaracomercio.com"
                },
                to: [{
                    email: destinatario,
                    name: datosInvitacion.nombre
                }],
                subject: template.subject,
                htmlContent: template.html
            };

            // Agregar imagen QR como adjunto si existe
            if (datosInvitacion.qr_image) {
                emailData.attachment = [{
                    content: datosInvitacion.qr_image, // Base64 de la imagen
                    name: "codigo_qr.png",
                    type: "image/png"
                }];
            }

            const response = await axios.post(`${this.baseUrl}/smtp/email`, emailData, {
                headers: this.headers
            });

            console.log('✅ Códigos de invitación enviados:', response.data.messageId);
            return { success: true, messageId: response.data.messageId, etapa: 2 };
        } catch (error) {
            console.error('❌ Error enviando códigos:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    /**
     * Generar plantilla para FORMULARIO DE REGISTRO (Etapa 1)
     */
    generateFormularioTemplate(datosInvitacion) {
        const subject = `Formulario de Registro - ${datosInvitacion.evento_nombre}`;
        
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Formulario de Registro</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    margin: 0; 
                    padding: 0; 
                    background-color: #f4f4f4;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .header { 
                    background-color: #043474; 
                    color: white; 
                    padding: 30px 20px; 
                    text-align: center; 
                    border-radius: 10px 10px 0 0;
                }
                .header h1 { margin: 0; font-size: 28px; }
                .content { 
                    padding: 30px 20px; 
                    background-color: #f9f9f9; 
                }
                .event-info {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #043474;
                }
                .form-section {
                    background-color: white;
                    padding: 25px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border: 2px solid #e9ecef;
                }
                .footer { 
                    background-color: #333; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    font-size: 12px; 
                    border-radius: 0 0 10px 10px;
                }
                .btn { 
                    display: inline-block; 
                    padding: 15px 30px; 
                    background-color: #28a745; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold;
                    margin: 20px 0;
                }
                .btn:hover { background-color: #218838; }
                .highlight {
                    background-color: #fff3cd;
                    padding: 15px;
                    border-radius: 5px;
                    border-left: 4px solid #ffc107;
                    margin: 15px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📝 Formulario de Registro</h1>
                </div>
                <div class="content">
                    <p>Hola <strong>${datosInvitacion.nombre}</strong>,</p>
                    <p>¡Has sido invitado a un evento especial!</p>
                    
                    <div class="event-info">
                        <h2>📅 ${datosInvitacion.evento_nombre}</h2>
                        <p><strong>📆 Fecha:</strong> ${datosInvitacion.fecha_evento}</p>
                        <p><strong>📍 Lugar:</strong> ${datosInvitacion.lugar_evento}</p>
                    </div>

                    <div class="highlight">
                        <h3>⚠️ Acción Requerida</h3>
                        <p>Para completar tu registro y recibir tu código de acceso, debes llenar el formulario de confirmación.</p>
                    </div>
                    
                    <div class="form-section">
                        <h3>📋 Formulario de Confirmación</h3>
                        <p>En este formulario podrás:</p>
                        <ul>
                            <li>✅ Confirmar tu asistencia</li>
                            <li>✅ Registrar acompañantes</li>
                            <li>✅ Proporcionar información adicional</li>
                            <li>✅ Especificar necesidades especiales</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${datosInvitacion.formulario_url || 'http://localhost:3000/formulario/' + datosInvitacion.codigo_unico}" class="btn">
                            📝 Llenar Formulario
                        </a>
                    </div>

                    <div class="highlight">
                        <p><strong>📱 También puedes acceder desde WhatsApp:</strong></p>
                        <p>Envía "FORMULARIO" al número de WhatsApp de la Cámara de Comercio</p>
                    </div>
                </div>
                <div class="footer">
                    <p>Una vez completado el formulario, recibirás tu código de acceso</p>
                    <p>Este es un mensaje automático de la Cámara de Comercio</p>
                </div>
            </div>
        </body>
        </html>
        `;

        return { subject, html };
    }

    /**
     * Generar plantilla para CÓDIGOS DE INVITACIÓN (Etapa 2)
     */
    generateCodigosTemplate(datosInvitacion) {
        const subject = `Códigos de Acceso - ${datosInvitacion.evento_nombre}`;
        
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Códigos de Acceso</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    margin: 0; 
                    padding: 0; 
                    background-color: #f4f4f4;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .header { 
                    background-color: #28a745; 
                    color: white; 
                    padding: 30px 20px; 
                    text-align: center; 
                    border-radius: 10px 10px 0 0;
                }
                .header h1 { margin: 0; font-size: 28px; }
                .content { 
                    padding: 30px 20px; 
                    background-color: #f9f9f9; 
                }
                .event-info {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #28a745;
                }
                .codes-section { 
                    text-align: center; 
                    margin: 30px 0; 
                    padding: 20px;
                    background-color: white;
                    border-radius: 8px;
                }
                .qr-code {
                    max-width: 200px;
                    height: auto;
                    border: 2px solid #28a745;
                    border-radius: 8px;
                }
                .code-highlight {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    font-family: monospace;
                    font-size: 20px;
                    font-weight: bold;
                    color: #28a745;
                    border: 2px solid #28a745;
                    margin: 15px 0;
                }
                .footer { 
                    background-color: #333; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    font-size: 12px; 
                    border-radius: 0 0 10px 10px;
                }
                .success-badge {
                    background-color: #d4edda;
                    color: #155724;
                    padding: 10px 20px;
                    border-radius: 20px;
                    display: inline-block;
                    margin: 10px 0;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 ¡Registro Completado!</h1>
                </div>
                <div class="content">
                    <p>Hola <strong>${datosInvitacion.nombre}</strong>,</p>
                    
                    <div class="success-badge">
                        ✅ Formulario completado exitosamente
                    </div>
                    
                    <p>Tu registro ha sido procesado. Aquí tienes tus códigos de acceso:</p>
                    
                    <div class="event-info">
                        <h2>📅 ${datosInvitacion.evento_nombre}</h2>
                        <p><strong>📆 Fecha:</strong> ${datosInvitacion.fecha_evento}</p>
                        <p><strong>📍 Lugar:</strong> ${datosInvitacion.lugar_evento}</p>
                    </div>
                    
                    <div class="codes-section">
                        <h3>🎫 Tu Código de Acceso</h3>
                        <div class="code-highlight">${datosInvitacion.codigo_unico}</div>
                        
                        <p><strong>Presenta el siguiente código QR en la entrada:</strong></p>
                        <img src="cid:codigo_qr.png" alt="Código QR" class="qr-code">
                        
                        <p><em>También puedes mostrar el código alfanumérico si no tienes el QR</em></p>
                    </div>

                    <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4>📋 Información Importante:</h4>
                        <ul>
                            <li>Llega 15 minutos antes del evento</li>
                            <li>Presenta tu código QR o alfanumérico</li>
                            <li>Trae una identificación oficial</li>
                            <li>Si tienes acompañantes, ellos también deben presentar sus códigos</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>¡Esperamos verte en el evento!</p>
                    <p>Cámara de Comercio - Sistema de Invitaciones</p>
                </div>
            </div>
        </body>
        </html>
        `;

        return { subject, html };
    }

    /**
     * Enviar WhatsApp - Formulario (Etapa 1)
     */
    async sendFormularioWhatsApp(destinatario, datosInvitacion) {
        try {
            // Verificar si hay template ID configurado
            if (!process.env.BREVO_WHATSAPP_TEMPLATE_ID || process.env.BREVO_WHATSAPP_TEMPLATE_ID === '') {
                console.log('⚠️ WhatsApp no configurado: Falta template ID');
                return { success: false, error: 'WhatsApp no configurado: Falta template ID' };
            }

            const message = `Hola ${datosInvitacion.nombre}! 📝

Has sido invitado al evento: *${datosInvitacion.evento_nombre}*

📅 Fecha: ${datosInvitacion.fecha_evento}
📍 Lugar: ${datosInvitacion.lugar_evento}

⚠️ *ACCIÓN REQUERIDA*
Para completar tu registro y recibir tu código de acceso, debes llenar el formulario de confirmación.

En el formulario podrás:
✅ Confirmar tu asistencia
✅ Registrar acompañantes
✅ Proporcionar información adicional

🔗 Formulario: ${datosInvitacion.formulario_url || 'http://localhost:3000/formulario/' + datosInvitacion.codigo_unico}

Una vez completado, recibirás tu código QR y alfanumérico.

¡Esperamos verte en el evento! 🎉`;

            const whatsappData = {
                templateId: process.env.BREVO_WHATSAPP_TEMPLATE_ID,
                senderNumber: process.env.BREVO_WHATSAPP_SENDER,
                contactNumbers: [destinatario],
                parameters: {
                    name: datosInvitacion.nombre,
                    evento: datosInvitacion.evento_nombre,
                    fecha: datosInvitacion.fecha_evento,
                    lugar: datosInvitacion.lugar_evento
                }
            };

            const response = await axios.post(`${this.baseUrl}/whatsapp/sendMessage`, whatsappData, {
                headers: this.headers
            });

            console.log('✅ WhatsApp formulario enviado:', response.data.messageId);
            return { success: true, messageId: response.data.messageId, etapa: 1 };
        } catch (error) {
            console.error('❌ Error enviando WhatsApp formulario:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    /**
     * Enviar WhatsApp - Códigos (Etapa 2)
     */
    async sendCodigosWhatsApp(destinatario, datosInvitacion) {
        try {
            // Verificar si hay template ID configurado
            if (!process.env.BREVO_WHATSAPP_TEMPLATE_ID || process.env.BREVO_WHATSAPP_TEMPLATE_ID === '') {
                console.log('⚠️ WhatsApp no configurado: Falta template ID');
                return { success: false, error: 'WhatsApp no configurado: Falta template ID' };
            }

            const message = `¡Registro completado! 🎉

Evento: *${datosInvitacion.evento_nombre}*
📅 Fecha: ${datosInvitacion.fecha_evento}
📍 Lugar: ${datosInvitacion.lugar_evento}

🎫 *Tu código de acceso:*
*${datosInvitacion.codigo_unico}*

Presenta este código en la entrada del evento.

📋 *Información importante:*
• Llega 15 minutos antes
• Presenta tu código QR o alfanumérico
• Trae identificación oficial
• Si tienes acompañantes, ellos también deben presentar sus códigos

¡Esperamos verte en el evento! 🎉`;

            const whatsappData = {
                templateId: process.env.BREVO_WHATSAPP_TEMPLATE_ID,
                senderNumber: process.env.BREVO_WHATSAPP_SENDER,
                contactNumbers: [destinatario],
                parameters: {
                    name: datosInvitacion.nombre,
                    evento: datosInvitacion.evento_nombre,
                    codigo: datosInvitacion.codigo_unico
                }
            };

            const response = await axios.post(`${this.baseUrl}/whatsapp/sendMessage`, whatsappData, {
                headers: this.headers
            });

            console.log('✅ WhatsApp códigos enviado:', response.data.messageId);
            return { success: true, messageId: response.data.messageId, etapa: 2 };
        } catch (error) {
            console.error('❌ Error enviando WhatsApp códigos:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    /**
     * Enviar con reintentos
     */
    async sendWithRetry(destinatario, datosInvitacion, tipo = 'email', etapa = 1, maxAttempts = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                console.log(`📧 Intento ${attempt}/${maxAttempts} enviando ${tipo} etapa ${etapa} a ${destinatario}`);
                
                let result;
                if (tipo === 'email') {
                    if (etapa === 1) {
                        result = await this.sendFormularioRegistro(destinatario, datosInvitacion);
                    } else {
                        result = await this.sendCodigosInvitacion(destinatario, datosInvitacion);
                    }
                } else if (tipo === 'whatsapp') {
                    if (etapa === 1) {
                        result = await this.sendFormularioWhatsApp(destinatario, datosInvitacion);
                    } else {
                        result = await this.sendCodigosWhatsApp(destinatario, datosInvitacion);
                    }
                }
                
                if (result.success) {
                    return result;
                }
                
                lastError = result.error;
            } catch (error) {
                lastError = error.message;
                console.error(`❌ Intento ${attempt} falló:`, error.message);
            }
            
            if (attempt < maxAttempts) {
                const delay = 1000 * Math.pow(2, attempt - 1); // Backoff exponencial
                console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw new Error(`Falló después de ${maxAttempts} intentos. Último error: ${lastError}`);
    }
}

module.exports = new BrevoService();