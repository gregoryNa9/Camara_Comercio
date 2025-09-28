const axios = require("axios");

const sendWhatsApp = async (phone, message, qrLink = null) => {
    try {
        let fullMessage = message;
        if (qrLink) fullMessage += `\nEscanea tu QR: ${qrLink}`;

        const url = `${process.env.WHATSAPP_API_URL}?phone=${phone}&text=${encodeURIComponent(fullMessage)}&token=${process.env.WHATSAPP_API_TOKEN}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error enviando WhatsApp:", error);
        throw error;
    }
};

module.exports = sendWhatsApp;
