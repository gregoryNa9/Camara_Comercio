// routes/confirmaciones.routes.js
const express = require("express");
const router = express.Router();
const confirmacionesController = require("../controllers/confirmaciones.controller");

// CRUD completo
router.get("/", confirmacionesController.getAll);       // Obtener todos
router.post("/", confirmacionesController.create);      // Crear
router.put("/:id", confirmacionesController.update);    // Actualizar
router.delete("/:id", confirmacionesController.delete); // Eliminar

module.exports = router;
