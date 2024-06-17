const admin = require('firebase-admin');
const db = admin.firestore();

exports.register = async (req, res) => {
    const { email, password, phoneNumber, username } = req.body;

    if (!email || !password || !phoneNumber || !username) {
        return res.status(400).json({
            message: 'All fields (email, password, phoneNumber, username) are required.'
        });
    }

    try {
        // Buat user baru di Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            phoneNumber,
            username
        });

        // Simpan user data di Firestore
        await db.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            phoneNumber: userRecord.phoneNumber,
            uid: userRecord.uid,
            username: username,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                phoneNumber: userRecord.phoneNumber,
                username: username
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
