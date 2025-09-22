const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const controller = require("../controllers/usuarios.controller");

router.get("/", controller.getAll);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;
=======
const usuarioController = require("../controllers/usuarios.controller");

// CRUD completo
router.get("/", usuarioController.getAll);       // Obtener todos
router.post("/", usuarioController.create);      // Crear
router.put("/:id", usuarioController.update);    // Actualizar
router.delete("/:id", usuarioController.delete); // Eliminar

module.exports = router;
>>>>>>> 73fe9df (Conexión con la BDD)
