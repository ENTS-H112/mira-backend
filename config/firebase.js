const admin = require('firebase-admin');
const serviceAccount = 'mira-team-64edeb72841f.json'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'mira-team.appspot.com',
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
