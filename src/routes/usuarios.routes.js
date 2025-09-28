const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarios.controller");

// CRUD completo
router.get("/", usuarioController.getAll);       // Obtener todos
router.get("/cedula/:cedula", usuarioController.getByCedula); // Buscar por cédula
router.post("/", usuarioController.create);      // Crear
router.put("/:id", usuarioController.update);    // Actualizar
router.delete("/:id", usuarioController.delete); // Eliminar

module.exports = router;
