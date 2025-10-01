const { v4: uuidv4 } = require("uuid");
const generateQR = require("./generateQR");

/**
 * Genera código alfanumérico para acompañante basado en el código principal
 * @param {string} codigoPrincipal - Código del invitado principal
 * @param {number} index - Índice del acompañante (1, 2, 3...)
 * @returns {string} Código alfanumérico del acompañante
 */
function generateAcompananteCode(codigoPrincipal, index) {
    // Extraer la parte base del código principal (ej: "EV028FE" -> "EV028")
    const baseCode = codigoPrincipal.substring(0, codigoPrincipal.length - 2);
    
    // Generar sufijo único para el acompañante
    const suffix = String(index).padStart(2, '0'); // 01, 02, 03...
    
    // Combinar: base + sufijo
    return `${baseCode}${suffix}`;
}

/**
 * Genera código QR para acompañante
 * @param {string} codigoAcompanante - Código alfanumérico del acompañante
 * @returns {Promise<Object>} Objeto con qrDataURL y filePath
 */
async function generateAcompananteQR(codigoAcompanante) {
    try {
        const qrResult = await generateQR(codigoAcompanante, true); // Pasar true para guardar archivo
        // Convertir ruta absoluta a ruta relativa para el servidor
        const relativePath = qrResult.filePath.replace(/\\/g, '/').replace(/.*\/src\//, '/');
        return {
            qrDataURL: qrResult.qrDataURL,
            filePath: relativePath
        };
    } catch (error) {
        console.error("Error generando QR para acompañante:", error);
        throw error;
    }
}

/**
 * Genera códigos completos para un acompañante
 * @param {string} codigoPrincipal - Código del invitado principal
 * @param {number} index - Índice del acompañante
 * @returns {Promise<Object>} Objeto con código alfanumérico y QR
 */
async function generateAcompananteCodes(codigoPrincipal, index) {
    const codigoAcompanante = generateAcompananteCode(codigoPrincipal, index);
    const qrResult = await generateAcompananteQR(codigoAcompanante);
    
    return {
        codigo_participante: codigoAcompanante,
        qr_participante: qrResult.filePath,
        qr_data_url: qrResult.qrDataURL
    };
}

module.exports = {
    generateAcompananteCode,
    generateAcompananteQR,
    generateAcompananteCodes
};
