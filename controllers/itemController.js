const { db, bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Helper function to validate date and time
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const isValidTime = (timeString) => {
  const timeRegExp = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegExp.test(timeString);
};

exports.addAppointment = async (req, res) => {
  try {
    const { uid } = req.user; // Ambil ID pengguna dari middleware autentikasi
    const { nama_pasien, alamat, tanggal_lahir, gender, no_hp, email, tanggal_kunjungan, jam_kunjungan } = req.body;

    if (!nama_pasien || !alamat || !tanggal_lahir || !gender || !no_hp || !email || !tanggal_kunjungan || !jam_kunjungan) {
      return res.status(400).send('All fields are required.');
    }

    if (!isValidDate(tanggal_lahir) || !isValidDate(tanggal_kunjungan)) {
      return res.status(400).send('Invalid date format.');
    }

    if (!isValidTime(jam_kunjungan)) {
      return res.status(400).send('Invalid time format.');
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
      return res.status(400).send('Mohon maaf, jadwal yang Anda pilih sudah terisi. Silakan pilih jadwal lain.');
    }

    // Hitung jumlah dokumen dengan tanggal kunjungan yang sama
    const countSnapshot = await db.collection('pasien')
      .where('tanggal_kunjungan', '==', tanggal_kunjungan_formatted)
      .get();

    const nomor_antrian = `${tanggal_kunjungan_formatted}-${countSnapshot.size + 1}`;

    const id = uuidv4();
    const itemData = {
      id,
      user_id: uid, // Tambahkan ID pengguna ke data pasien
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

    res.status(201).send("Berhasil membuat janji temu.");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get all patients for the logged-in user
exports.getPatients = async (req, res) => {
  try {
    const { uid } = req.user; // Ambil ID pengguna dari middleware autentikasi
    const snapshot = await db.collection('pasien')
      .where('user_id', '==', uid)
      .get();
    const items = snapshot.docs.map(doc => doc.data());
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get patient by ID
exports.getPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection('pasien').doc(id).get();
    if (!snapshot.exists) {
      return res.status(404).send('Item not found.');
    }
    const item = snapshot.data();
    res.status(200).send(item);
  } catch (error) {
    res.status(500).send(error.message);
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

// Get notification by patient ID
exports.getNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection('pasien').doc(id).get();
    if (!snapshot.exists) {
      return res.status(404).send('Item not found.');
    }
    const item = snapshot.data();
    res.status(200).send(`Status janji temu Anda: ${item.status}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

// Get user from Firebase Authentication and users collection
exports.getUser = async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await db.collection('users').doc(uid).get();
    if (!user.exists) {
      return res.status(404).send('User not found.');
    }
    res.status(200).send(user.data());
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Upload file to Google Cloud Storage
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Check if the file is an image
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).send('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on('error', (err) => res.status(500).send(err.message));

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).send({ fileUrl: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get file by filename
exports.getFile = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).send('Filename is required.');
    }

    const file = bucket.file(filename);

    // Check if the file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).send('File not found.');
    }

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    res.status(200).send({ fileUrl: publicUrl });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
