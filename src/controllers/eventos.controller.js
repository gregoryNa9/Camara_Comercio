const Evento = require("../models/Eventos");
const Confirmacion = require("../models/Confirmacion");
const Invitacion = require("../models/Invitacion");
const Usuario = require("../models/Usuario");
const Acompanante = require("../models/Acompanante");
const exportExcel = require("../utils/exportExcel");

// Obtener todos los eventos
exports.getAll = async (req, res) => {
    try {
        const data = await Evento.findAll();
        // 🔹 Mapear campos de la base de datos al formato que espera el frontend
        const eventosMapeados = data.map(evento => ({
            id: evento.id_evento,
            nombreEvento: evento.nombre_evento,
            categoria: evento.categoria,
            temaEvento: evento.tema_evento,
            temaConferencia: evento.tema_conferencia,
            fecha: evento.fecha,
            lugar: evento.lugar,
            horaInicio: evento.hora_inicio,
            horaFin: evento.hora_fin,
            codigoVestimenta: evento.codigo_vestimenta,
            organizadoPor: evento.organizado_por,
            estado: evento.estado_evento
        }));
        res.json(eventosMapeados);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener eventos", error: error.message });
    }
};

// Obtener un evento por ID
exports.getById = async (req, res) => {
    try {
        const evento = await Evento.findByPk(req.params.id);
        if (!evento) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }
        // 🔹 Mapear campos de la base de datos al formato que espera el frontend
        const eventoMapeado = {
            id: evento.id_evento,
            nombreEvento: evento.nombre_evento,
            categoria: evento.categoria,
            temaEvento: evento.tema_evento,
            temaConferencia: evento.tema_conferencia,
            fecha: evento.fecha,
            lugar: evento.lugar,
            horaInicio: evento.hora_inicio,
            horaFin: evento.hora_fin,
            codigoVestimenta: evento.codigo_vestimenta,
            organizadoPor: evento.organizado_por,
            estado: evento.estado_evento
        };
        res.json(eventoMapeado);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener evento", error: error.message });
    }
};

// Crear un nuevo evento
exports.create = async (req, res) => {
    try {
        // 🔹 Mapear campos del frontend al formato de la base de datos
        const datosEvento = {
            nombre_evento: req.body.nombreEvento,
            categoria: req.body.categoria,
            tema_evento: req.body.temaEvento,
            tema_conferencia: req.body.temaConferencia,
            fecha: req.body.fecha,
            lugar: req.body.lugar,
            hora_inicio: req.body.horaInicio,
            hora_fin: req.body.horaFin,
            codigo_vestimenta: req.body.codigoVestimenta,
            organizado_por: req.body.organizadoPor,
            estado_evento: req.body.estado || 'Activo'
        };
        
        const data = await Evento.create(datosEvento);
        res.status(201).json({ message: "Evento creado con éxito", data });
    } catch (error) {
        res.status(400).json({ message: "Error al crear evento", error: error.message });
    }
};

// Actualizar un evento
exports.update = async (req, res) => {
    try {
        // 🔹 Mapear campos del frontend al formato de la base de datos
        const datosEvento = {
            nombre_evento: req.body.nombreEvento,
            categoria: req.body.categoria,
            tema_evento: req.body.temaEvento,
            tema_conferencia: req.body.temaConferencia,
            fecha: req.body.fecha,
            lugar: req.body.lugar,
            hora_inicio: req.body.horaInicio,
            hora_fin: req.body.horaFin,
            codigo_vestimenta: req.body.codigoVestimenta,
            organizado_por: req.body.organizadoPor,
            estado_evento: req.body.estado
        };
        
        const [updated] = await Evento.update(datosEvento, { where: { id_evento: req.params.id } });
        if (updated === 0) {
            return res.status(404).json({ message: "Evento no encontrado para actualizar" });
        }
        res.json({ message: "Evento actualizado con éxito" });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar evento", error: error.message });
    }
};

// Eliminar un evento
exports.delete = async (req, res) => {
    try {
        const deleted = await Evento.destroy({ where: { id_evento: req.params.id } });
        if (deleted === 0) {
            return res.status(404).json({ message: "Evento no encontrado para eliminar" });
        }
        res.json({ message: "Evento eliminado con éxito" });
    } catch (error) {
        res.status(400).json({ message: "Error al eliminar evento", error: error.message });
    }
};

// Exportar confirmados de un evento en Excel
exports.exportConfirmados = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar que el evento existe
        const evento = await Evento.findByPk(id);
        if (!evento) {
            return res.status(404).json({ message: "Evento no encontrado" });
        }

        // Obtener confirmaciones del evento (principales y acompañantes)
        const confirmaciones = await Confirmacion.findAll({
            include: [
                {
                    model: Invitacion,
                    as: 'Invitacion',
                    where: { id_evento: id },
                    include: [
                        {
                            model: Usuario,
                            as: 'Usuario',
                            attributes: ['cedula', 'nombre', 'correo', 'telefono', 'empresa', 'cargo']
                        }
                    ],
                    attributes: ['codigo_unico', 'qr_url', 'numero_acompanantes']
                }
            ],
            attributes: [
                'id_confirmacion',
                'nombre',
                'correo',
                'telefono',
                'cargo',
                'direccion',
                'fecha_confirmacion',
                'es_acompanante',
                'tipo_participante',
                'codigo_participante',
                'qr_participante',
                'id_confirmacion_padre'
            ],
            order: [
                ['id_confirmacion_padre', 'ASC'],
                ['id_confirmacion', 'ASC']
            ]
        });

        // Preparar datos para Excel - cada confirmación es una fila
        const datosExcel = confirmaciones.map(conf => {
            const esAcompanante = conf.es_acompanante || false;
            const tipoParticipante = conf.tipo_participante || (esAcompanante ? 'Acompañante' : 'Principal');
            
            return {
                'ID Confirmación': conf.id_confirmacion,
                'Tipo': tipoParticipante,
                'Cédula': conf.Invitacion?.Usuario?.cedula || '',
                'Nombre': conf.nombre || conf.Invitacion?.Usuario?.nombre || '',
                'Correo': conf.correo || conf.Invitacion?.Usuario?.correo || '',
                'Teléfono': conf.telefono || conf.Invitacion?.Usuario?.telefono || '',
                'Empresa': conf.Invitacion?.Usuario?.empresa || '',
                'Cargo': conf.cargo || conf.Invitacion?.Usuario?.cargo || '',
                'Dirección': conf.direccion || '',
                'Código Principal': conf.Invitacion?.codigo_unico || '',
                'Código Participante': conf.codigo_participante || conf.Invitacion?.codigo_unico || '',
                'Ruta QR Principal': conf.Invitacion?.qr_url || '',
                'Ruta QR Participante': conf.qr_participante || conf.Invitacion?.qr_url || '',
                'ID Confirmación Padre': conf.id_confirmacion_padre || '',
                'Fecha Confirmación': conf.fecha_confirmacion ? new Date(conf.fecha_confirmacion).toLocaleDateString('es-ES') : ''
            };
        });

        // Generar Excel
        const buffer = await exportExcel(datosExcel, `Confirmados_${evento.nombre_evento.replace(/[^a-zA-Z0-9]/g, '_')}`);
        
        if (!buffer) {
            return res.status(404).json({ message: "No hay confirmaciones para exportar" });
        }

        // Configurar headers para descarga
        const nombreArchivo = `Confirmados_${evento.nombre_evento.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
        res.setHeader('Content-Length', buffer.length);
        
        res.send(buffer);
    } catch (error) {
        console.error("Error al exportar confirmados:", error);
        res.status(500).json({ message: "Error al exportar confirmados", error: error.message });
    }
};
