const admin = require('firebase-admin');

// Inisialisasi aplikasi Firebase Admin SDK
const serviceAccount = require('./tesdulu.json'); // Ganti dengan path ke file service account key Anda

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Fungsi untuk membuat token
const generateToken = async (uid) => {
  try {
    const token = await admin.auth().createCustomToken(uid);
    console.log("Token:", token);
  } catch (error) {
    console.error("Error generating token:", error);
  }
};

// Ganti dengan UID pengguna Anda
generateToken('your-user-uid');
