const express = require("express");
const router = express.Router();
const confirmacionesController = require("../controllers/confirmaciones.controller");

// CRUD completo
router.get("/", confirmacionesController.getAll);   // Obtener todas las confirmaciones
router.post("/", confirmacionesController.create);  // Crear confirmación automáticamente desde formulario
router.put("/:id", confirmacionesController.update); 
router.delete("/:id", confirmacionesController.delete);

module.exports = router;
