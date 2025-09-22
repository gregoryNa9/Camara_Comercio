const ExcelJS = require("exceljs");

const exportExcel = async (data, sheetName = "Reporte") => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    if (data.length === 0) return null;

    // Agregar encabezados
    sheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));

    // Agregar filas
    data.forEach(item => sheet.addRow(item));

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

module.exports = exportExcel;
