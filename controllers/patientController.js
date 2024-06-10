const { db, bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Helper function to validate date and time
function isValidDate(date) {
    return moment(date, 'YYYY-MM-DD', true).isValid();
}

function isValidTime(time) {
    return moment(time, 'HH:mm', true).isValid();
}

// Add appointment
exports.addAppointment = async (req, res) => {
    try {
        const { uid } = req.user;
        const { nama_pasien, alamat, tanggal_lahir, gender, no_hp, email, tanggal_kunjungan, jam_kunjungan, jenis_periksa } = req.body;

        if (!nama_pasien || !alamat || !tanggal_lahir || !gender || !no_hp || !email || !tanggal_kunjungan || !jam_kunjungan || !jenis_periksa) {
            return res.status(400).send('All fields are required.');
        }

        if (!isValidDate(tanggal_lahir) || !isValidDate(tanggal_kunjungan)) {
            return res.status(400).send('Invalid date format.');
        }

        if (!isValidTime(jam_kunjungan)) {
            return res.status(400).send('Invalid time format.');
        }

        const today = moment().format('YYYY-MM-DD');
        const userAppointments = await db.collection('pasien')
            .where('user_id', '==', uid)
            .where('tanggal_kunjungan', '==', today)
            .get();

        if (userAppointments.size >= 2) {
            return res.status(400).json({
                message: 'Anda telah mencapai batas maksimal 2 appointment per hari.'
            });
        }

        const dayOfWeek = moment(tanggal_kunjungan).format('dddd');
        const startTime = moment(jam_kunjungan, 'HH:mm');
        const endTime = startTime.clone().add(1, 'hour').format('HH:mm');

        const tanggal_kunjungan_formatted = moment(tanggal_kunjungan).format('YYYY/MM/DD');

        // Check if there is a conflicting appointment
        const snapshot = await db.collection('pasien')
            .where('tanggal_kunjungan', '==', tanggal_kunjungan_formatted)
            .where('jam_kunjungan', '>=', startTime.format('HH:mm'))
            .where('jam_kunjungan', '<=', endTime)
            .get();

        if (!snapshot.empty) {
            return res.status(400).json({
                message: 'Mohon maaf, jadwal reservasi sudah terisi. Silakan pilih jadwal lain.'
            });
        }

        // Hitung jumlah dokumen dengan tanggal kunjungan yang sama
        const countSnapshot = await db.collection('pasien')
            .where('tanggal_kunjungan', '==', tanggal_kunjungan_formatted)
            .get();

        const nomor_antrian = `${tanggal_kunjungan_formatted}-${countSnapshot.size + 1}`;

        const id = uuidv4();
        const itemData = {
            id,
            user_id: uid,
            nama_pasien,
            alamat,
            tanggal_lahir: moment(tanggal_lahir).format('YYYY-MM-DD'),
            gender,
            no_hp,
            email,
            tanggal_kunjungan: tanggal_kunjungan_formatted,
            hari_kunjungan: dayOfWeek,
            jam_kunjungan: `${startTime.format('HH:mm')}-${endTime}`,
            nomor_antrian,
            jenis_periksa,
            status_hasil: false,
            status: 'Menunggu Konfirmasi'
        };

        await db.collection('pasien').doc(id).set(itemData);

        // Update nomor antrian
        const updatedSnapshot = await db.collection('pasien')
            .where('tanggal_kunjungan', '==', tanggal_kunjungan_formatted)
            .orderBy('timestamp', 'asc')
            .get();

        updatedSnapshot.forEach((doc, index) => {
            doc.ref.update({ nomor_antrian: `${tanggal_kunjungan_formatted}-${index + 1}` });
        });

        res.status(201).json({
            message: 'Reservasi berhasil ditambahkan.',
            data: itemData
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Get all patients for the logged-in user
exports.getPatients = async (req, res) => {
    try {
        const { uid } = req.user;
        const snapshot = await db.collection('pasien')
            .where('user_id', '==', uid)
            .get();
        const items = snapshot.docs.map(doc => doc.data());
        res.status(200).send(items);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Get all appointments
exports.getAppointments = async (req, res) => {
    try {
        const snapshot = await db.collection('pasien').get();
        const items = snapshot.docs.map(doc => doc.data());
        res.status(200).send(items);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

// Get patient by ID
exports.getPatient = async (req, res) => {
    try {
        const { id } = req.params;
        const snapshot = await db.collection('pasien').doc(id).get();
        if (!snapshot.exists) {
            return res.status(404).json({
                message: 'Patient not found.'
            })
        }
        const item = snapshot.data();
        res.status(200).send(item);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Delete patient by ID
exports.deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('pasien').doc(id);

        const docSnapshot = await docRef.get();
        if (!docSnapshot.exists) {
            return res.status(404).send('Patient not found.');
        }

        await docRef.delete();
        res.status(200).json({
            message: 'Patient deleted successfully.'
        })
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Update patient by ID
exports.updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_pasien, alamat, email, no_hp, tanggal_lahir } = req.body;

        const docRef = db.collection('pasien').doc(id);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            return res.status(404).json({
                message: 'Patient not found.'
            });
        }

        const currentData = docSnapshot.data();

        const updatedData = {
            nama_pasien: nama_pasien !== undefined ? nama_pasien : currentData.nama_pasien,
            alamat: alamat !== undefined ? alamat : currentData.alamat,
            email: email !== undefined ? email : currentData.email,
            no_hp: no_hp !== undefined ? no_hp : currentData.no_hp,
            tanggal_lahir: tanggal_lahir !== undefined ? moment(tanggal_lahir).format('YYYY-MM-DD') : currentData.tanggal_lahir
        };

        await docRef.update(updatedData);
        res.status(200).json({
            message: 'Patient updated successfully.'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Get history patient by patient ID
exports.getHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const snapshot = await db.collection('pasien')
            .where('id', '==', id)
            .get();
        const history = snapshot.docs.map(doc => ({
            nama: doc.data().nama_pasien,
            waktu_pemeriksaan: `${doc.data().hari_kunjungan}, ${doc.data().tanggal_kunjungan} pukul ${doc.data().jam_kunjungan}`,
            status: doc.data().status
        }));
        res.status(200).send(history);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Update status and send notifications
exports.updateStatus = async (req, res) => {
    try {
        const { uid } = req.user;
        const { id } = req.params;
        const { status, status_hasil } = req.body;

        const docRef = db.collection('pasien').doc(id);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            return res.status(404).json({
                message: 'Patient not found.'
            });
        }

        const currentData = docSnapshot.data();

        // Ensure the user is updating their own data
        if (currentData.user_id !== uid) {
            return res.status(403).json({
                message: 'Unauthorized to update this data.'
            });
        }

        // Create updated data object
        const updatedData = {
            status: status !== undefined ? status : currentData.status,
            status_hasil: status_hasil !== undefined ? status_hasil : currentData.status_hasil
        };

        await docRef.update(updatedData); // Update the document in Firestore

        // Prepare notifications
        let notifications = [];

        if (status !== undefined && status !== currentData.status) {
            notifications.push({
                notification: {
                    title: 'Status Reservasi Diperbarui',
                    body: `Status janji temu Anda telah diperbarui menjadi ${updatedData.status}`
                },
                token: currentData.fcmToken
            });
        }

        if (status_hasil !== undefined && status_hasil !== currentData.status_hasil) {
            notifications.push({
                notification: {
                    title: 'Status Hasil Diperbarui',
                    body: `Status hasil Anda telah diperbarui menjadi ${updatedData.status_hasil ? 'true' : 'false'}`
                },
                token: currentData.fcmToken
            });
        }

        // Send notifications
        notifications.forEach((message) => {
            admin.messaging().send(message)
                .then((response) => {
                    console.log('Successfully sent message:', response);
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                });
        });

        res.status(200).json({
            message: 'Status updated successfully.'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Add result to the patient
exports.addResult = async (req, res) => {
    try {
        const { id } = req.params;

        const docRef = db.collection('pasien').doc(id);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            return res.status(404).json({
                message: 'Patient not found.'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded.'
            });
        }

        const fileName = `result/${uuidv4()}-${req.file.originalname}`;
        const file = bucket.file(fileName);

        // Upload the file to Firebase Storage
        await file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype }
        });

        // Get the public URL of the uploaded file
        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // Update the Firestore document with the file URL
        await docRef.update({ result: fileUrl });

        res.status(200).json({
            message: 'Result added successfully.',
            fileUrl: fileUrl
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get result by patient ID
exports.getResult = async (req, res) => {
    try {
        const { id } = req.params;
        const snapshot = await db.collection('pasien').doc(id).get();
        if (!snapshot.exists) {
            return res.status(404).json({
                message: 'Patient not found.'
            });
        }
        const data = snapshot.data();
        if (!data.result) {
            return res.status(404).json({
                message: 'Result not found.'
            });
        }
        res.status(200).json({
            result: data.result
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};