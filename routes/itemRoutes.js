const express = require('express');
const router = express.Router();
const controller = require('../controllers/itemController');
const authenticate = require('../middleware/authenticate');
const multer = require('multer');
const upload = multer();

// Rute untuk menambahkan item dengan autentikasi
router.post('/add', authenticate, controller.addItem);

// Rute untuk mendapatkan semua pasien untuk pengguna yang login
router.get('/patients', authenticate, controller.getPatients);

// Rute untuk mendapatkan pasien berdasarkan ID
router.get('/patient/:id', authenticate, controller.getPatient);

// Rute untuk mendapatkan riwayat pasien berdasarkan ID pasien
router.get('/patient/:id/history', authenticate, controller.getHistory);

// Rute untuk mendapatkan notifikasi pasien berdasarkan ID pasien
router.get('/patient/:id/notification', authenticate, controller.getNotification);

// Rute untuk mengunggah file dengan autentikasi
router.post('/upload', authenticate, upload.single('file'), controller.uploadFile);

// Rute untuk mengakses file yang sudah diunggah
router.get('/file/:filename', controller.getFile);

module.exports = router;
