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

exports.addItem = async (req, res) => {
  try {
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


exports.getItems = async (req, res) => {
  try {
    const snapshot = await db.collection('pasien').get();
    const items = snapshot.docs.map(doc => doc.data());
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getItem = async (req, res) => {
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

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
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
