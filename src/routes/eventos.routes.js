const express = require("express");
const router = express.Router();
const eventoController = require("../controllers/eventos.controller");

// CRUD completo
router.get("/", eventoController.getAll);        // Obtener todos
router.get("/:id", eventoController.getById);    // Obtener por ID
router.post("/", eventoController.create);       // Crear
router.put("/:id", eventoController.update);     // Actualizar
router.delete("/:id", eventoController.delete);  // Eliminar

module.exports = router;
