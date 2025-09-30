const Confirmacion = require("../models/Confirmacion");
const Formulario = require("../models/Formulario");
const Evento = require("../models/Eventos");

// Obtener todas las confirmaciones con datos planos y nombre del evento
exports.getAll = async (req, res) => {
    try {
        const data = await Confirmacion.findAll({
            include: {
                model: Formulario,
                attributes: ["nombre", "correo", "telefono", "cargo", "direccion", "id_evento"],
                include: { model: Evento, attributes: ["nombre_evento"] }
            }
        });

        // Transformamos los datos para que sean planos y listos para el frontend
        const result = data.map(item => ({
            id_confirmacion: item.id_confirmacion,
            nombre_evento: item.Formulario.Evento?.nombre_evento || "",
            nombre: item.Formulario.nombre,
            correo: item.Formulario.correo,
            telefono: item.Formulario.telefono,
            cargo: item.Formulario.cargo,
            direccion: item.Formulario.direccion,
            fecha_confirmacion: item.fecha_confirmacion,
            acciones: item.acciones
        }));

        res.json(result);
    } catch (error) {
        console.error("Error al obtener confirmaciones:", error);
        res.status(500).json({ message: "Error al obtener confirmaciones", error: error.message });
    }
};

// Crear confirmación automáticamente cuando un formulario se completa
exports.create = async (req, res) => {
    try {
        const { id_formulario } = req.body;

        // Verificar que el formulario existe
        const formulario = await Formulario.findByPk(id_formulario);
        if (!formulario) {
            return res.status(404).json({ message: "Formulario no encontrado" });
        }

        // Crear confirmación automática
        const confirmacion = await Confirmacion.create({ id_formulario });

        res.status(201).json({ message: "Confirmación creada automáticamente", confirmacion });
    } catch (error) {
        res.status(400).json({ message: "Error al crear confirmación", error: error.message });
    }
};

// Actualizar y eliminar (opcional)
exports.update = async (req, res) => {
    try {
        const [updated] = await Confirmacion.update(req.body, { where: { id_confirmacion: req.params.id } });
        if (updated === 0) return res.status(404).json({ message: "Confirmación no encontrada para actualizar" });
        res.json({ message: "Confirmación actualizada con éxito" });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar confirmación", error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Confirmacion.destroy({ where: { id_confirmacion: req.params.id } });
        if (deleted === 0) return res.status(404).json({ message: "Confirmación no encontrada para eliminar" });
        res.json({ message: "Confirmación eliminada con éxito" });
    } catch (error) {
        res.status(400).json({ message: "Error al eliminar confirmación", error: error.message });
    }
};
