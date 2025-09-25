/**
 * Configuración para integraciones de envío
 * Este archivo centraliza la configuración para diferentes proveedores de servicios
 */

const integrations = {
    // Configuración de Email
    email: {
        // Proveedores soportados
        providers: {
            gmail: {
                service: 'gmail',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            },
            sendgrid: {
                apiKey: process.env.SENDGRID_API_KEY,
                from: process.env.SENDGRID_FROM_EMAIL || 'noreply@tuevento.com'
            },
            mailgun: {
                apiKey: process.env.MAILGUN_API_KEY,
                domain: process.env.MAILGUN_DOMAIN,
                from: process.env.MAILGUN_FROM_EMAIL || 'noreply@tuevento.com'
            }
        },
        // Configuración por defecto
        defaultProvider: process.env.EMAIL_PROVIDER || 'gmail',
        // Plantillas de email
        templates: {
            invitacion: {
                subject: 'Invitación - {{evento_nombre}}',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Invitación de Evento</title>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background-color: #043474; color: white; padding: 20px; text-align: center; }
                            .content { padding: 20px; background-color: #f9f9f9; }
                            .qr-code { text-align: center; margin: 20px 0; }
                            .footer { background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
                            .btn { display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Invitación de Evento</h1>
                            </div>
                            <div class="content">
                                <p>Hola {{nombre}},</p>
                                <p>Has sido invitado al evento <strong>{{evento_nombre}}</strong>.</p>
                                <p><strong>Fecha:</strong> {{fecha_evento}}</p>
                                <p><strong>Lugar:</strong> {{lugar_evento}}</p>
                                <p><strong>Tu código único:</strong> <code>{{codigo_unico}}</code></p>
                                <div class="qr-code">
                                    <p>Presenta el siguiente código QR en la entrada:</p>
                                    <img src="{{qr_image}}" alt="Código QR" style="max-width: 200px;">
                                </div>
                                <p style="text-align: center;">
                                    <a href="{{confirmacion_url}}" class="btn">Confirmar Asistencia</a>
                                </p>
                            </div>
                            <div class="footer">
                                <p>Este es un mensaje automático, por favor no responder.</p>
                                <p><a href="{{unsubscribe_url}}" style="color: #ccc;">Cancelar suscripción</a></p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            }
        }
    },

    // Configuración de WhatsApp
    whatsapp: {
        // Proveedores soportados
        providers: {
            twilio: {
                accountSid: process.env.TWILIO_ACCOUNT_SID,
                authToken: process.env.TWILIO_AUTH_TOKEN,
                from: process.env.TWILIO_WHATSAPP_NUMBER
            },
            whatsapp_business: {
                accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
                phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
                verifyToken: process.env.WHATSAPP_VERIFY_TOKEN
            },
            api_whatsapp: {
                url: process.env.WHATSAPP_API_URL,
                token: process.env.WHATSAPP_API_TOKEN
            }
        },
        // Configuración por defecto
        defaultProvider: process.env.WHATSAPP_PROVIDER || 'api_whatsapp',
        // Plantillas de WhatsApp (deben estar aprobadas por Meta)
        templates: {
            invitacion: {
                name: 'invitacion_evento',
                language: 'es',
                components: [
                    {
                        type: 'body',
                        parameters: [
                            { type: 'text', text: '{{nombre}}' },
                            { type: 'text', text: '{{evento_nombre}}' },
                            { type: 'text', text: '{{codigo_unico}}' }
                        ]
                    }
                ]
            }
        }
    },

    // Configuración de QR
    qr: {
        // Opciones de generación de QR
        options: {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
        },
        // URL base para validación
        validationUrl: process.env.QR_VALIDATION_URL || 'https://tuevento.com/validar/',
        // Tiempo de expiración en días
        expirationDays: 30
    },

    // Configuración de reintentos
    retry: {
        maxAttempts: 3,
        delayMs: 1000,
        backoffMultiplier: 2
    },

    // Configuración de logging
    logging: {
        enabled: process.env.LOGGING_ENABLED === 'true',
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/integrations.log'
    }
};

module.exports = integrations;
