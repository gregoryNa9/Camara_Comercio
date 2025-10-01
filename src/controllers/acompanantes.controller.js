const Acompanante = require("../models/Acompanante");
const Confirmacion = require("../models/Confirmacion");

// Obtener acompañantes de una confirmación
exports.getByConfirmacion = async (req, res) => {
    try {
        const { id_confirmacion } = req.params;
        
        const acompanantes = await Acompanante.findAll({
            where: { id_confirmacion },
            order: [['fecha_registro', 'ASC']]
        });
        
        res.json(acompanantes);
    } catch (error) {
        console.error("Error al obtener acompañantes:", error);
        res.status(500).json({ 
            message: "Error al obtener acompañantes", 
            error: error.message 
        });
    }
};

// Crear acompañante
exports.create = async (req, res) => {
    try {
        const { id_confirmacion, nombre, cedula, correo, telefono, cargo, empresa } = req.body;
        
        // Validar que la confirmación existe
        const confirmacion = await Confirmacion.findByPk(id_confirmacion);
        if (!confirmacion) {
            return res.status(404).json({ message: "Confirmación no encontrada" });
        }
        
        // Validar datos requeridos
        if (!nombre) {
            return res.status(400).json({ message: "El nombre es requerido" });
        }
        
        // Crear acompañante
        const acompanante = await Acompanante.create({
            id_confirmacion,
            nombre,
            cedula: cedula || null,
            correo: correo || null,
            telefono: telefono || null,
            cargo: cargo || null,
            empresa: empresa || null,
            fecha_registro: new Date()
        });
        
        res.status(201).json({
            message: "Acompañante registrado exitosamente",
            acompanante
        });
    } catch (error) {
        console.error("Error al crear acompañante:", error);
        res.status(500).json({ 
            message: "Error al crear acompañante", 
            error: error.message 
        });
    }
};

// Crear múltiples acompañantes
exports.createMultiple = async (req, res) => {
    try {
        const { id_confirmacion, acompanantes } = req.body;
        
        // Validar que la confirmación existe
        const confirmacion = await Confirmacion.findByPk(id_confirmacion);
        if (!confirmacion) {
            return res.status(404).json({ message: "Confirmación no encontrada" });
        }
        
        // Validar que hay acompañantes
        if (!acompanantes || !Array.isArray(acompanantes) || acompanantes.length === 0) {
            return res.status(400).json({ message: "Se requiere al menos un acompañante" });
        }
        
        // Validar cada acompañante
        for (const acompanante of acompanantes) {
            if (!acompanante.nombre) {
                return res.status(400).json({ 
                    message: "Todos los acompañantes deben tener nombre" 
                });
            }
        }
        
        // Crear acompañantes
        const acompanantesCreados = await Acompanante.bulkCreate(
            acompanantes.map(acompanante => ({
                id_confirmacion,
                nombre: acompanante.nombre,
                cedula: acompanante.cedula || null,
                correo: acompanante.correo || null,
                telefono: acompanante.telefono || null,
                cargo: acompanante.cargo || null,
                empresa: acompanante.empresa || null,
                fecha_registro: new Date()
            }))
        );
        
        res.status(201).json({
            message: `${acompanantesCreados.length} acompañantes registrados exitosamente`,
            acompanantes: acompanantesCreados
        });
    } catch (error) {
        console.error("Error al crear acompañantes:", error);
        res.status(500).json({ 
            message: "Error al crear acompañantes", 
            error: error.message 
        });
    }
};

// Actualizar acompañante
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, cedula, correo, telefono, cargo, empresa } = req.body;
        
        const [updated] = await Acompanante.update({
            nombre,
            cedula: cedula || null,
            correo: correo || null,
            telefono: telefono || null,
            cargo: cargo || null,
            empresa: empresa || null
        }, {
            where: { id_acompanante: id }
        });
        
        if (updated === 0) {
            return res.status(404).json({ message: "Acompañante no encontrado" });
        }
        
        res.json({ message: "Acompañante actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar acompañante:", error);
        res.status(500).json({ 
            message: "Error al actualizar acompañante", 
            error: error.message 
        });
    }
};

// Eliminar acompañante
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleted = await Acompanante.destroy({
            where: { id_acompanante: id }
        });
        
        if (deleted === 0) {
            return res.status(404).json({ message: "Acompañante no encontrado" });
        }
        
        res.json({ message: "Acompañante eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar acompañante:", error);
        res.status(500).json({ 
            message: "Error al eliminar acompañante", 
            error: error.message 
        });
    }
};
