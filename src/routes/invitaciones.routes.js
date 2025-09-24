const express = require("express");
const router = express.Router();
const controller = require("../controllers/invitaciones.controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuración básica de multer (ajusta según tu estructura)
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, name);
    },
});
const upload = multer({ storage });

router.get("/", controller.getAll);
// Para crear: usamos upload.single('imagen') (el campo en el form debe llamarse 'imagen')
router.post("/", upload.single("imagen"), controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;
