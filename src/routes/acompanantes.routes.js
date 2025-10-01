const express = require("express");
const router = express.Router();
const acompanantesController = require("../controllers/acompanantes.controller");

// CRUD completo
router.get("/confirmacion/:id_confirmacion", acompanantesController.getByConfirmacion); // Obtener por confirmación
router.post("/", acompanantesController.create); // Crear uno
router.post("/multiple", acompanantesController.createMultiple); // Crear múltiples
router.put("/:id", acompanantesController.update); // Actualizar
router.delete("/:id", acompanantesController.delete); // Eliminar

module.exports = router;
