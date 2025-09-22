const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const generateQR = async (text, saveFile = false) => {
    try {
        const qrDataURL = await QRCode.toDataURL(text);

        // Si se pide guardar el archivo
        if (saveFile) {
            const filePath = path.join(__dirname, "../temp", `${text}.png`);
            await QRCode.toFile(filePath, text);
            return { qrDataURL, filePath };
        }

        return { qrDataURL };
    } catch (error) {
        console.error("Error generando QR:", error);
        throw error;
    }
};

module.exports = generateQR;
