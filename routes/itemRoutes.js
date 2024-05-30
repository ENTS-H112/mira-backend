const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const itemController = require('../controllers/itemController');

// Route untuk menambahkan pasien
router.post('/patients', itemController.addItem);

// Route untuk mendapatkan daftar pasien
router.get('/patients', itemController.getItems);

// Route untuk mendapatkan pasien berdasarkan id
router.get('/patient/:id', itemController.getItem);

// Route untuk mengunggah file
router.post('/upload', upload.single('file'), itemController.uploadFile);

module.exports = router;
