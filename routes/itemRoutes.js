const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const itemController = require('../controllers/itemController');

// Route untuk menambahkan pasien
router.post('/patients', itemController.addItem);

// Route untuk mendapatkan daftar pasien
router.get('/patients', itemController.getPatients);

// Route untuk mendapatkan pasien berdasarkan id
router.get('/patient/:id', itemController.getPatient);

// Route untuk history pasien
router.get('/history', itemController.getHistory);

// Route untuk history pasien berdasarkan id
router.get('/patient/:id/history', itemController.getHistory);

// Route untuk notifikasi pasien berdasarkan id
router.get('/patient/:id/notification', itemController.getNotification);

// Route untuk mengunggah file
router.post('/upload', upload.single('file'), itemController.uploadFile);

// Route untuk mengakses file
router.get('/file/:filename', itemController.getFile);

module.exports = router;
