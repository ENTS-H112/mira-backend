const admin = require('firebase-admin');
const axios = require('axios');
const db = admin.firestore();

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized, You need to login to access this route.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token, true);
    req.user = decodedToken;
    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      // Token sudah kadaluarsa, gunakan refresh token untuk mendapatkan yang baru
      try {
        const uid = error.auth.internalError.uid;
        const userRef = db.collection('users').doc(uid);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
          return res.status(401).json({ message: 'Unauthorized, User not found.' });
        }

        const { refreshToken } = userSnapshot.data();

        // Gunakan refresh token untuk mendapatkan id token baru
        const tokenResponse = await axios.post(`https://securetoken.googleapis.com/v1/token?key=AIzaSyBEo_j25kWJzXgr54Fzuza-xSLanbAYOj8`, {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        });

        const { id_token: newIdToken, refresh_token: newRefreshToken } = tokenResponse.data;

        // Perbarui refresh token di database
        await userRef.update({ refreshToken: newRefreshToken });

        // Verifikasi dan lanjutkan dengan token baru
        const newDecodedToken = await admin.auth().verifyIdToken(newIdToken, true);
        req.user = newDecodedToken;
        req.headers.authorization = `Bearer ${newIdToken}`;
        next();
      } catch (refreshError) {
        res.status(401).json({ message: 'Unauthorized, Failed to refresh token.', error: refreshError.message });
      }
    } else {
      res.status(401).json({ message: 'Unauthorized, token is invalid.', error: error.message });
    }
  }
};

module.exports = authenticate;
