const Usuario = require("../models/Usuario");

// Obtener todos los usuarios
exports.getAll = async (req, res) => {
    try {
        const data = await Usuario.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
    }
};

// Crear un nuevo usuario
exports.create = async (req, res) => {
    try {
        const data = await Usuario.create(req.body);
        res.status(201).json({ message: "Usuario creado con éxito", data });
    } catch (error) {
        res.status(400).json({ message: "Error al crear usuario", error: error.message });
    }
};

// Actualizar usuario por ID
exports.update = async (req, res) => {
    try {
        const [updated] = await Usuario.update(req.body, { where: { id_usuario: req.params.id } });
        if (updated === 0) {
            return res.status(404).json({ message: "Usuario no encontrado para actualizar" });
        }
        res.json({ message: "Usuario actualizado con éxito" });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar usuario", error: error.message });
    }
};

// Eliminar usuario por ID
exports.delete = async (req, res) => {
    try {
        const deleted = await Usuario.destroy({ where: { id_usuario: req.params.id } });
        if (deleted === 0) {
            return res.status(404).json({ message: "Usuario no encontrado para eliminar" });
        }
        res.json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        res.status(400).json({ message: "Error al eliminar usuario", error: error.message });
    }
};

// Buscar usuario por cédula
exports.getByCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        const usuario = await Usuario.findOne({ where: { cedula } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ message: "Error al buscar usuario", error: error.message });
    }
};