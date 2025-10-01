// controllers/confirmaciones.controller.js
const Confirmacion = require("../models/Confirmacion");
const Acompanante = require("../models/Acompanante");
const Invitacion = require("../models/Invitacion");
const Usuario = require("../models/Usuario");
const Evento = require("../models/Eventos");

exports.getAll = async (req, res) => {
    try {
        const data = await Confirmacion.findAll({
            include: [
                {
                    model: Invitacion,
                    as: 'Invitacion',
                    include: [
                        {
                            model: Usuario,
                            as: 'Usuario',
                            attributes: ['cedula', 'nombre', 'correo', 'telefono', 'empresa', 'cargo']
                        },
                        {
                            model: Evento,
                            as: 'Evento',
                            attributes: ['id_evento', 'nombre_evento', 'categoria', 'fecha', 'lugar']
                        }
                    ]
                },
                {
                    model: Acompanante,
                    as: 'Acompanantes',
                    required: false
                }
            ],
            order: [['fecha_confirmacion', 'DESC']]
        });
        
        // Mapear los datos para incluir información completa
        const confirmacionesMapeadas = data.map(confirmacion => ({
            id_confirmacion: confirmacion.id_confirmacion,
            nombre: confirmacion.nombre,
            correo: confirmacion.correo,
            telefono: confirmacion.telefono,
            cargo: confirmacion.cargo,
            direccion: confirmacion.direccion,
            fecha_confirmacion: confirmacion.fecha_confirmacion,
            es_acompanante: confirmacion.es_acompanante || false,
            tipo_participante: confirmacion.tipo_participante || 'Principal',
            codigo_participante: confirmacion.codigo_participante || null,
            qr_participante: confirmacion.qr_participante || null,
            id_confirmacion_padre: confirmacion.id_confirmacion_padre || null,
            evento: confirmacion.Invitacion?.Evento?.nombre_evento || 'Sin evento',
            evento_id: confirmacion.Invitacion?.Evento?.id_evento || null,
            categoria: confirmacion.Invitacion?.Evento?.categoria || 'Sin categoría',
            fecha_evento: confirmacion.Invitacion?.Evento?.fecha || null,
            lugar_evento: confirmacion.Invitacion?.Evento?.lugar || 'Sin lugar',
            codigo_unico: confirmacion.Invitacion?.codigo_unico || 'Sin código',
            usuario_original: {
                cedula: confirmacion.Invitacion?.Usuario?.cedula || '',
                nombre: confirmacion.Invitacion?.Usuario?.nombre || '',
                correo: confirmacion.Invitacion?.Usuario?.correo || '',
                telefono: confirmacion.Invitacion?.Usuario?.telefono || '',
                empresa: confirmacion.Invitacion?.Usuario?.empresa || '',
                cargo: confirmacion.Invitacion?.Usuario?.cargo || ''
            },
            acompanantes: confirmacion.Acompanantes || []
        }));
        
        res.json(confirmacionesMapeadas);
    } catch (error) {
        console.error("Error al obtener confirmaciones:", error);
        res.status(500).json({ message: "Error al obtener confirmaciones", error: error.message });
    }
};

exports.exportarConfirmaciones = async (req, res) => {
    try {
        const exportExcel = require("../utils/exportExcel");
        
        // Obtener todas las confirmaciones con datos completos
        const data = await Confirmacion.findAll({
            include: [
                {
                    model: Invitacion,
                    as: 'Invitacion',
                    include: [
                        {
                            model: Usuario,
                            as: 'Usuario',
                            attributes: ['cedula', 'nombre', 'correo', 'telefono', 'empresa', 'cargo']
                        },
                        {
                            model: Evento,
                            as: 'Evento',
                            attributes: ['id_evento', 'nombre_evento', 'categoria', 'fecha', 'lugar']
                        }
                    ]
                }
            ],
            order: [['fecha_confirmacion', 'DESC']]
        });
        
        // Preparar datos para Excel
        const datosExcel = data.map(confirmacion => ({
            'ID Confirmación': confirmacion.id_confirmacion,
            'Tipo': confirmacion.tipo_participante || 'Principal',
            'Nombre': confirmacion.nombre,
            'Correo': confirmacion.correo,
            'Teléfono': confirmacion.telefono || '',
            'Cargo': confirmacion.cargo || '',
            'Dirección': confirmacion.direccion || '',
            'Cédula Original': confirmacion.Invitacion?.Usuario?.cedula || '',
            'Empresa Original': confirmacion.Invitacion?.Usuario?.empresa || '',
            'Código Principal': confirmacion.Invitacion?.codigo_unico || '',
            'Código Participante': confirmacion.codigo_participante || confirmacion.Invitacion?.codigo_unico || '',
            'Ruta QR Principal': confirmacion.Invitacion?.qr_url || '',
            'Ruta QR Participante': confirmacion.qr_participante || confirmacion.Invitacion?.qr_url || '',
            'Evento': confirmacion.Invitacion?.Evento?.nombre_evento || 'Sin evento',
            'Categoría': confirmacion.Invitacion?.Evento?.categoria || 'Sin categoría',
            'Fecha Evento': confirmacion.Invitacion?.Evento?.fecha ? new Date(confirmacion.Invitacion.Evento.fecha).toLocaleDateString('es-ES') : '',
            'Lugar Evento': confirmacion.Invitacion?.Evento?.lugar || 'Sin lugar',
            'ID Confirmación Padre': confirmacion.id_confirmacion_padre || '',
            'Es Acompañante': confirmacion.es_acompanante ? 'Sí' : 'No',
            'Fecha Confirmación': confirmacion.fecha_confirmacion ? new Date(confirmacion.fecha_confirmacion).toLocaleDateString('es-ES') : ''
        }));

        const buffer = await exportExcel(datosExcel, `Confirmaciones_Completas`);
        
        if (!buffer) {
            return res.status(404).json({ message: "No hay confirmaciones para exportar" });
        }

        const nombreArchivo = `Confirmaciones_Completas_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
        res.setHeader('Content-Length', buffer.length);
        
        res.send(buffer);
    } catch (error) {
        console.error("Error al exportar confirmaciones:", error);
        res.status(500).json({ message: "Error al exportar confirmaciones", error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await Confirmacion.create(req.body);
        res.status(201).json({ message: "Confirmación creada con éxito", data });
    } catch (error) {
        res.status(400).json({ message: "Error al crear confirmación", error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Confirmacion.update(req.body, { where: { id_confirmacion: req.params.id } });
        if (updated === 0) {
            return res.status(404).json({ message: "Confirmación no encontrada para actualizar" });
        }
        res.json({ message: "Confirmación actualizada con éxito" });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar confirmación", error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Confirmacion.destroy({ where: { id_confirmacion: req.params.id } });
        if (deleted === 0) {
            return res.status(404).json({ message: "Confirmación no encontrada para eliminar" });
        }
        res.json({ message: "Confirmación eliminada con éxito" });
    } catch (error) {
        res.status(400).json({ message: "Error al eliminar confirmación", error: error.message });
    }
};
