const express = require('express');
const router = express.Router();
const controller = require('../controllers/itemController');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/multer');
// const upload = multer();

// Rute untuk mendapatkan user yang login
router.get('/user', authenticate, controller.getUser);

// Rute untuk memperbarui profil pengguna
router.patch('/user', authenticate, upload.single('profile_picture'), controller.updateProfile);

// Rute untuk menambahkan item dengan autentikasi
router.post('/add', authenticate, controller.addAppointment);

// Rute untuk mendapatkan semua pasien untuk pengguna yang login
router.get('/patients', authenticate, controller.getPatients);

// Rute untuk mendapatkan pasien berdasarkan ID
router.get('/patient/:id', authenticate, controller.getPatient);

// Rute untuk mendapatkan riwayat pasien berdasarkan ID pasien
router.get('/patient/:id/history', authenticate, controller.getHistory);

// Rute untuk mendapatkan notifikasi pasien berdasarkan ID pasien
router.get('/patient/:id/notification', authenticate, controller.updateStatus);

// Rute untuk mengunggah file dengan autentikasi
router.post('/upload', authenticate, upload.single('file'), controller.uploadFile);

// Rute untuk mengakses file yang sudah diunggah
router.get('/file/:filename', controller.getFile);

module.exports = router;
