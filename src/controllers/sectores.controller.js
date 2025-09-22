const SectorEconomico = require("../models/SectorEconomico");

exports.getAll = async (req, res) => {
    try {
        const data = await SectorEconomico.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener sectores económicos", error });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await SectorEconomico.create(req.body);
        res.status(201).json({ message: "Sector económico creado", data });
    } catch (error) {
        res.status(400).json({ message: "Error al crear sector económico", error });
    }
};

exports.update = async (req, res) => {
    try {
        await SectorEconomico.update(req.body, { where: { id_sector: req.params.id } });
        res.json({ message: "Sector económico actualizado" });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar sector económico", error });
    }
};

exports.delete = async (req, res) => {
    try {
        await SectorEconomico.destroy({ where: { id_sector: req.params.id } });
        res.json({ message: "Sector económico eliminado" });
    } catch (error) {
        res.status(400).json({ message: "Error al eliminar sector económico", error });
    }
};
