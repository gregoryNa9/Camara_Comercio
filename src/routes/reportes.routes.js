const express = require("express");
const router = express.Router();
const reportesController = require("../controllers/reportes.controller");

// Rutas para reportes
router.get("/", reportesController.getAll);
router.get("/stats", reportesController.getStats);
router.get("/chart-data", reportesController.getChartData);
router.get("/top-usuarios", reportesController.getTopUsuarios);

module.exports = router;
