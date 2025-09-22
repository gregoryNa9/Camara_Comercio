const MetodoEnvio = require("../models/MetodoEnvio");

exports.getAll = async (req, res) => {
    try {
        const data = await MetodoEnvio.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener métodos de envío", error });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await MetodoEnvio.create(req.body);
        res.status(201).json({ message: "Método de envío creado", data });
    } catch (error) {
        res.status(400).json({ message: "Error al crear método de envío", error });
    }
};

exports.update = async (req, res) => {
    try {
        await MetodoEnvio.update(req.body, { where: { id_metodo_envio: req.params.id } });
        res.json({ message: "Método de envío actualizado" });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar método de envío", error });
    }
};

exports.delete = async (req, res) => {
    try {
        await MetodoEnvio.destroy({ where: { id_metodo_envio: req.params.id } });
        res.json({ message: "Método de envío eliminado" });
    } catch (error) {
        res.status(400).json({ message: "Error al eliminar método de envío", error });
    }
};
