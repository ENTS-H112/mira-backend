const express = require('express');
const router = express.Router();
const controller = require('../controllers/itemController');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/multer');

// Rute menambah dokter
router.post('/doctor', authenticate, upload.single('profile_picture'), controller.addDoctor);

// Rute untuk mendapatkan semua dokter
router.get('/doctors', authenticate, controller.getDoctors);

// Rute untuk mendapatkan dokter berdasarkan ID
router.get('/doctor/:id', authenticate, controller.getDoctor);

// Rute untuk update dokter berdasarkan ID
router.patch('/doctor/:id', authenticate, upload.single('profile_picture'), controller.updateDoctor);

// Rute untuk menghapus dokter berdasarkan ID
router.delete('/doctor/:id', authenticate, controller.deleteDoctor);

// Rute untuk mendapatkan user yang login
router.get('/user', authenticate, controller.getUser);

// Rute untuk memperbarui profil pengguna
router.patch('/user', authenticate, upload.single('profile_picture'), controller.updateProfile);

// Rute untuk mendapatkan notifikasi pasien berdasarkan ID user
router.get('/user/:id/notification', authenticate, controller.updateStatus);

// Rute untuk menambahkan item dengan autentikasi
router.post('/add', authenticate, controller.addAppointment);

// Rute untuk mendapatkan semua pasien untuk pengguna yang login
router.get('/patients', authenticate, controller.getPatients);

// Rute untuk mendapatkan pasien berdasarkan ID
router.get('/patient/:id', authenticate, controller.getPatient);

// delete patient by id
router.delete('/patient/:id', authenticate, controller.deletePatient);

// Rute untuk mengupdate pasien berdasarkan ID
router.patch('/patient/:id', authenticate, controller.updatePatient);

// Rute untuk mendapatkan riwayat pasien berdasarkan ID pasien
router.get('/patient/:id/history', authenticate, controller.getHistory);

// Rute untuk mengunggah file dengan autentikasi
router.post('/upload', authenticate, upload.single('file'), controller.uploadFile);

// Rute untuk mengakses file yang sudah diunggah
router.get('/file/:filename', controller.getFile);

module.exports = router;
