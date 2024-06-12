const admin = require('firebase-admin');
const serviceAccount = 'mira-team-firebase-adminsdk-i5a75-f2fe6fded0.json'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'mira-team.appspot.com',
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
