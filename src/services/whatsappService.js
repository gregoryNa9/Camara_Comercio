const axios = require('axios');
const integrations = require('../config/integrations');

class WhatsAppService {
    constructor() {
        this.provider = integrations.whatsapp.defaultProvider;
        this.config = integrations.whatsapp.providers[this.provider];
    }

    async sendInvitacion(destinatario, datosInvitacion) {
        try {
            let message = `Hola ${datosInvitacion.nombre},\n\n`;
            message += `Has sido invitado al evento: *${datosInvitacion.evento_nombre}*\n`;
            message += `📅 Fecha: ${datosInvitacion.fecha_evento}\n`;
            message += `📍 Lugar: ${datosInvitacion.lugar_evento}\n`;
            message += `🎫 Tu código único: *${datosInvitacion.codigo_unico}*\n\n`;
            message += `Presenta el código QR adjunto en la entrada del evento.\n\n`;
            message += `¡Esperamos verte allí!`;

            if (this.provider === 'api_whatsapp') {
                return await this.sendViaApi(destinatario, message, datosInvitacion.qr_image);
            } else if (this.provider === 'twilio') {
                return await this.sendViaTwilio(destinatario, message, datosInvitacion.qr_image);
            } else if (this.provider === 'whatsapp_business') {
                return await this.sendViaBusinessApi(destinatario, message, datosInvitacion.qr_image);
            }
        } catch (error) {
            console.error('❌ Error enviando WhatsApp:', error);
            return { success: false, error: error.message };
        }
    }

    async sendViaApi(destinatario, message, qrImage) {
        try {
            let fullMessage = message;
            if (qrImage) {
                fullMessage += `\n\nEscanea tu QR: ${qrImage}`;
            }

            const url = `${this.config.url}?phone=${destinatario}&text=${encodeURIComponent(fullMessage)}&token=${this.config.token}`;
            const response = await axios.get(url);
            
            console.log('✅ WhatsApp enviado via API:', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('❌ Error enviando WhatsApp via API:', error);
            return { success: false, error: error.message };
        }
    }

    async sendViaTwilio(destinatario, message, qrImage) {
        try {
            const twilio = require('twilio');
            const client = twilio(this.config.accountSid, this.config.authToken);
            
            const messageData = {
                from: this.config.from,
                to: `whatsapp:${destinatario}`,
                body: message
            };

            if (qrImage) {
                messageData.mediaUrl = [qrImage];
            }

            const result = await client.messages.create(messageData);
            console.log('✅ WhatsApp enviado via Twilio:', result.sid);
            return { success: true, messageId: result.sid };
        } catch (error) {
            console.error('❌ Error enviando WhatsApp via Twilio:', error);
            return { success: false, error: error.message };
        }
    }

    async sendViaBusinessApi(destinatario, message, qrImage) {
        try {
            const url = `https://graph.facebook.com/v17.0/${this.config.phoneNumberId}/messages`;
            
            const messageData = {
                messaging_product: 'whatsapp',
                to: destinatario,
                type: 'text',
                text: { body: message }
            };

            if (qrImage) {
                messageData.type = 'image';
                messageData.image = { link: qrImage };
            }

            const response = await axios.post(url, messageData, {
                headers: {
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ WhatsApp enviado via Business API:', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('❌ Error enviando WhatsApp via Business API:', error);
            return { success: false, error: error.message };
        }
    }

    async sendWithRetry(destinatario, datosInvitacion, maxAttempts = integrations.retry.maxAttempts) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                console.log(`📱 Intento ${attempt}/${maxAttempts} enviando WhatsApp a ${destinatario}`);
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

module.exports = new WhatsAppService();
