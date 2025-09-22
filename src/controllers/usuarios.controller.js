const Usuario = require("../models/Usuario");

<<<<<<< HEAD
=======
// Obtener todos los usuarios
>>>>>>> 73fe9df (Conexión con la BDD)
exports.getAll = async (req, res) => {
    try {
        const data = await Usuario.findAll();
        res.json(data);
    } catch (error) {
<<<<<<< HEAD
        res.status(500).json({ message: "Error al obtener usuarios", error });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await Usuario.create(req.body);
        res.status(201).json({ message: "Usuario creado", data });
    } catch (error) {
        res.status(400).json({ message: "Error al crear usuario", error });
    }
};

exports.update = async (req, res) => {
    try {
        await Usuario.update(req.body, { where: { id_usuario: req.params.id } });
        res.json({ message: "Usuario actualizado" });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar usuario", error });
    }
};

exports.delete = async (req, res) => {
    try {
        await Usuario.destroy({ where: { id_usuario: req.params.id } });
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(400).json({ message: "Error al eliminar usuario", error });
=======
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
>>>>>>> 73fe9df (Conexión con la BDD)
    }
};
