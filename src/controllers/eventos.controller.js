const Evento = require("../models/Eventos");

// Obtener todos los eventos
exports.getAll = async (req, res) => {
    try {
        const data = await Evento.findAll();
        res.json(data);
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
        res.json(evento);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener evento", error: error.message });
    }
};

// Crear un nuevo evento
exports.create = async (req, res) => {
    try {
        const data = await Evento.create(req.body);
        res.status(201).json({ message: "Evento creado con éxito", data });
    } catch (error) {
        res.status(400).json({ message: "Error al crear evento", error: error.message });
    }
};

// Actualizar un evento
exports.update = async (req, res) => {
    try {
        const [updated] = await Evento.update(req.body, { where: { id_evento: req.params.id } });
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
