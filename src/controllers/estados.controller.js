const EstadoInvitacion = require("../models/EstadoInvitacion");

exports.getAll = async (req, res) => {
    try {
        const data = await EstadoInvitacion.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener estados de invitación", error });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await EstadoInvitacion.create(req.body);
        res.status(201).json({ message: "Estado de invitación creado", data });
    } catch (error) {
        res.status(400).json({ message: "Error al crear estado de invitación", error });
    }
};

exports.update = async (req, res) => {
    try {
        await EstadoInvitacion.update(req.body, { where: { id_estado: req.params.id } });
        res.json({ message: "Estado de invitación actualizado" });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar estado de invitación", error });
    }
};

exports.delete = async (req, res) => {
    try {
        await EstadoInvitacion.destroy({ where: { id_estado: req.params.id } });
        res.json({ message: "Estado de invitación eliminado" });
    } catch (error) {
        res.status(400).json({ message: "Error al eliminar estado de invitación", error });
    }
};
