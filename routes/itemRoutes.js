const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const patientController = require('../controllers/patientController');
const userController = require('../controllers/userController');
const fileController = require('../controllers/fileController');
const loginController = require('../controllers/login');
const registerController = require('../controllers/register');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/multer');


router.post('/login', loginController.login);
router.post('/register', registerController.register);
router.post('/doctor', authenticate, upload.single('profile_picture'), doctorController.addDoctor);
router.get('/doctors', authenticate, doctorController.getDoctors);
router.get('/doctor/:id', authenticate, doctorController.getDoctor);
router.patch('/doctor/:id', authenticate, upload.single('profile_picture'), doctorController.updateDoctor);
router.delete('/doctor/:id', authenticate, doctorController.deleteDoctor);
router.get('/user', authenticate, userController.getUser);
router.patch('/user', authenticate, upload.single('profile_picture'), userController.updateProfile);
router.get('/patient/:id/notification', authenticate, patientController.updateStatus);
router.post('/add', authenticate, patientController.addAppointment);
router.get('/appointments', authenticate, patientController.getAppointments);
router.get('/patients', authenticate, patientController.getPatients);
router.get('/patient/:id', authenticate, patientController.getPatient);
router.delete('/patient/:id', authenticate, patientController.deletePatient);
router.patch('/patient/:id', authenticate, patientController.updatePatient);
router.get('/patient/:id/history', authenticate, patientController.getHistory);
router.post('/patient/:id/result', authenticate, upload.single('result'), patientController.addResult);
router.get('/patient/:id/result', authenticate, patientController.getResult);
router.post('/upload', authenticate, upload.single('file'), fileController.uploadFile);
router.get('/file/:filename', fileController.getFile);

module.exports = router;
