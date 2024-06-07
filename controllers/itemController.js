const { db, bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Add doctor to collection dokter
exports.addDoctor = async (req, res) => {
  try {
    const { nama, spesialis, no_hp, email } = req.body;

    if (!nama || !spesialis || !no_hp || !email) {
      return res.status(400).send('All fields are required.');
    }

    let profilePictureUrl = '';

    // Handle file upload
    if (req.file) {
      const fileName = `profile_pictures/${uuidv4()}-${req.file.originalname}`;
      const file = bucket.file(fileName);

      const blobStream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          reject(err);
        });

        blobStream.on('finish', () => {
          profilePictureUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve();
        });

        blobStream.end(req.file.buffer);
      });
    }

    const id = uuidv4();
    const itemData = {
      id,
      nama,
      spesialis,
      no_hp,
      email,
      profile_picture: profilePictureUrl,
    };

    await db.collection('dokter').doc(id).set(itemData);
    res.status(201).send('Dokter berhasil ditambahkan.');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get all doctors
exports.getDoctors = async (req, res) => {
  try {
    const snapshot = await db.collection('dokter').get();

    const items = snapshot.docs.map(doc => doc.data());
    res.status(200).send(items);
  } catch (error) {

    res.status(500).send(error.message);
  }

};

// Get doctor by ID
exports.getDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection('dokter').doc(id).get();
    if (!snapshot.exists) {
      return res.status(404).json({
        message: 'Doctor not found.'
      })
    }
    const item = snapshot.data();
    res.status(200).json({
      data: item
    })
  }
  catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
};

// Update doctor information
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, spesialis, no_hp, email } = req.body;

    const docRef = db.collection('dokter').doc(id);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({
        message: 'Doctor not found.'
      })
    }

    const currentData = docSnapshot.data();

    let profilePictureUrl = currentData.profile_picture;

    // Handle file upload
    if (req.file) {
      const fileName = `profile_pictures/${uuidv4()}-${req.file.originalname}`;
      const file = bucket.file(fileName);

      const blobStream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          reject(err);
        });

        blobStream.on('finish', () => {
          profilePictureUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve();
        });

        blobStream.end(req.file.buffer);
      });
    }

    const updatedData = {
      nama: nama !== undefined ? nama : currentData.nama,
      spesialis: spesialis !== undefined ? spesialis : currentData.spesialis,
      no_hp: no_hp !== undefined ? no_hp : currentData.no_hp,
      email: email !== undefined ? email : currentData.email,
      profile_picture: profilePictureUrl,
    };

    await docRef.update(updatedData);
    res.status(200).json({
      message: 'Doctor updated successfully.',
    })
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Delete doctor by ID
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('dokter').doc(id);
    const docSnapshot = await docRef.get();
    if (!docSnapshot.exists) {
      return res.status(404).send('Doctor not found.');
    }

    await docRef.delete();
    res.status(200).send('Doctor deleted successfully.');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Helper function to validate date and time
function isValidDate(date) {
  return moment(date, 'YYYY-MM-DD', true).isValid();
}

function isValidTime(time) {
  return moment(time, 'HH:mm', true).isValid();
}

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

// Get user from Firebase Authentication and users collection
exports.getUser = async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await db.collection('users').doc(uid).get();
    if (!user.exists) {
      return res.status(404).send('User not found.');
    }
    const userData = user.data();
    userData.user_id = uid; // Add user_id to the response
    res.status(200).send(userData);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Function to remove undefined fields from an object
const removeUndefinedFields = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { username, phoneNumber, email } = req.body;
    const userRef = db.collection('users').doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({
        message: 'User not found.'
      })
    }

    const currentUserData = userSnapshot.data();

    const updatedData = {
      username: username !== undefined ? username : currentUserData.username,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : currentUserData.phoneNumber,
      email: email !== undefined ? email : currentUserData.email,
    };

    // Remove undefined fields
    const cleanUpdatedData = removeUndefinedFields(updatedData);

    if (req.file) {
      const blob = bucket.file(`profile_pictures/${uid}-${req.file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      blobStream.on('error', (err) => {
        console.error(`Error uploading file: ${err.message}`);
        res.status(500).send(err.message);
      });

      blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        cleanUpdatedData.profile_picture = publicUrl;
        await userRef.update(cleanUpdatedData);
        res.status(200).send('Profile updated successfully.');
      });

      blobStream.end(req.file.buffer);
    } else {
      await userRef.update(cleanUpdatedData);
      res.status(200).send('Profile updated successfully.');
    }
  } catch (error) {
    console.error(`Error updating profile: ${error.message}`);
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
