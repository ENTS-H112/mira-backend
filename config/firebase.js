const admin = require('firebase-admin');
const serviceAccount = require("../mira-team-firebase-adminsdk-i5a75-9c5fa1090e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'mira-dicom-image'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
