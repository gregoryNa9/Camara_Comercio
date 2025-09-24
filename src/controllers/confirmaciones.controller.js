// controllers/confirmaciones.controller.js
const Confirmacion = require("../models/Confirmacion");

exports.getAll = async (req, res) => {
    try {
        const data = await Confirmacion.findAll();
        res.json(data);
    } catch (error) {
        console.error("Error al obtener confirmaciones:", error);
        res.status(500).json({ message: "Error al obtener confirmaciones", error: error.message });
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
