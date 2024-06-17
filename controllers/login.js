const admin = require('firebase-admin');
const axios = require('axios');
const db = admin.firestore();

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);
    const tokenResponse = await admin.auth().createCustomToken(user.uid);
    
    const idTokenResponse = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBEo_j25kWJzXgr54Fzuza-xSLanbAYOj8`, {
      email,
      password,
      returnSecureToken: true
    });

    const { idToken, refreshToken } = idTokenResponse.data;

    // Simpan refresh token di database Anda
    await db.collection('users').doc(user.uid).set({ refreshToken }, { merge: true });

    res.status(200).json({ idToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
