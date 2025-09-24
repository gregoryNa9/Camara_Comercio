const Evento = require("../models/Eventos");

// Obtener todos los eventos
exports.getAll = async (req, res) => {
    try {
        const data = await Evento.findAll();
        // 🔹 Mapear campos de la base de datos al formato que espera el frontend
        const eventosMapeados = data.map(evento => ({
            id: evento.id_evento,
            nombre: evento.nombre_evento,
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
            nombre: evento.nombre_evento,
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
            nombre_evento: req.body.nombre,
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
            nombre_evento: req.body.nombre,
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
