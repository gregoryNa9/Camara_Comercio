const nodemailer = require('nodemailer');
const integrations = require('../config/integrations');

class EmailService {
    constructor() {
        this.provider = integrations.email.defaultProvider;
        this.config = integrations.email.providers[this.provider];
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            if (this.provider === 'gmail') {
                this.transporter = nodemailer.createTransporter({
                    service: this.config.service,
                    port: this.config.port,
                    secure: this.config.secure,
                    auth: this.config.auth
                });
            } else if (this.provider === 'sendgrid') {
                // Implementar SendGrid
                this.transporter = nodemailer.createTransporter({
                    service: 'SendGrid',
                    auth: {
                        user: 'apikey',
                        pass: this.config.apiKey
                    }
                });
            } else if (this.provider === 'mailgun') {
                // Implementar Mailgun
                this.transporter = nodemailer.createTransporter({
                    service: 'Mailgun',
                    auth: {
                        user: this.config.apiKey,
                        pass: this.config.apiKey
                    }
                });
            }
        } catch (error) {
            console.error('Error inicializando transporter de email:', error);
        }
    }

    async sendInvitacion(destinatario, datosInvitacion) {
        try {
            const template = integrations.email.templates.invitacion;
            
            // Reemplazar variables en la plantilla
            let html = template.html;
            html = html.replace(/\{\{nombre\}\}/g, datosInvitacion.nombre);
            html = html.replace(/\{\{evento_nombre\}\}/g, datosInvitacion.evento_nombre);
            html = html.replace(/\{\{fecha_evento\}\}/g, datosInvitacion.fecha_evento);
            html = html.replace(/\{\{lugar_evento\}\}/g, datosInvitacion.lugar_evento);
            html = html.replace(/\{\{codigo_unico\}\}/g, datosInvitacion.codigo_unico);
            html = html.replace(/\{\{qr_image\}\}/g, datosInvitacion.qr_image);
            html = html.replace(/\{\{confirmacion_url\}\}/g, datosInvitacion.confirmacion_url || '#');
            html = html.replace(/\{\{unsubscribe_url\}\}/g, datosInvitacion.unsubscribe_url || '#');

            const subject = template.subject.replace(/\{\{evento_nombre\}\}/g, datosInvitacion.evento_nombre);

            const mailOptions = {
                from: this.config.from || process.env.EMAIL_USER,
                to: destinatario,
                subject: subject,
                html: html,
                attachments: datosInvitacion.attachments || []
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email enviado correctamente:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Error enviando email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendWithRetry(destinatario, datosInvitacion, maxAttempts = integrations.retry.maxAttempts) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                console.log(`📧 Intento ${attempt}/${maxAttempts} enviando email a ${destinatario}`);
                const result = await this.sendInvitacion(destinatario, datosInvitacion);
                
                if (result.success) {
                    return result;
                }
                
                lastError = result.error;
            } catch (error) {
                lastError = error.message;
                console.error(`❌ Intento ${attempt} falló:`, error.message);
            }
            
            if (attempt < maxAttempts) {
                const delay = integrations.retry.delayMs * Math.pow(integrations.retry.backoffMultiplier, attempt - 1);
                console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw new Error(`Falló después de ${maxAttempts} intentos. Último error: ${lastError}`);
    }
}

module.exports = new EmailService();
