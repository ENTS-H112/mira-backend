const { db, bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

exports.addItem = async (req, res) => {
  try {
    const { nama_pasien, alamat, tanggal_lahir, gender, no_hp, email, tanggal_kunjungan } = req.body;

    if (!nama_pasien || !alamat || !tanggal_lahir || !gender) {
      return res.status(400).send('All fields are required.');
    }

    const id = uuidv4();
    const itemData = {
      id,
      nama_pasien,
      alamat,
      tanggal_lahir,
      gender,
      no_hp,
      email,
      tanggal_kunjungan
    };

    await db.collection('pasien').doc(id).set(itemData);
    res.status(201).send(itemData);
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
        const item = snapshot.data();
        res.status(200).send(item);
    } catch (error) {
        res.status(500).send(error.message);
    }
    };

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
