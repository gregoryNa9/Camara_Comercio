<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const controller = require("../controllers/confirmaciones.controller");

router.get("/", controller.getAll);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
=======
// routes/confirmaciones.routes.js
const express = require("express");
const router = express.Router();
const confirmacionesController = require("../controllers/confirmaciones.controller");

router.get("/", confirmacionesController.getAll);
>>>>>>> 73fe9df (Conexión con la BDD)

module.exports = router;
