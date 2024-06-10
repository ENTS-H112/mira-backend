const { db, bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const { encryptData, decryptData } = require('../utils/cryptoUtils');

// Add doctor to collection dokter
exports.addDoctor = async (req, res) => {
    try {
        const { nama, spesialis, no_hp, email } = req.body;

        if (!nama || !spesialis || !no_hp || !email) {
            return res.status(400).json({
                message: 'All fields are required.'
            })
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

        // Enkripsi data sebelum menyimpan
        const encryptedData = encryptData(itemData);

        await db.collection('doctors').doc(id).set({ data: encryptedData });
        res.status(201).json({
            message: 'Doctor added successfully'
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

// Get all doctors
exports.getDoctors = async (req, res) => {
    try {
        const snapshot = await db.collection('doctors').get();
        const items = snapshot.docs.map(doc => {
            const encryptedData = doc.data().data;
            const decryptedData = decryptData(encryptedData);
            return decryptedData;
        });

        res.status(200).send(items);
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

// Get doctor by ID
exports.getDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('doctors').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({
                message: 'Doctor not found'
            })
        }

        const encryptedData = doc.data().data;
        const decryptedData = decryptData(encryptedData);

        res.status(200).send(decryptedData);
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

// Update doctor by ID
exports.updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, spesialis, no_hp, email } = req.body;

        const docRef = db.collection('doctors').doc(id);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            return res.status(404).json({
                message: 'Doctor not found.'
            });
        }

        const currentData = docSnapshot.data().data;
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

        // Merge updated fields with current data
        const updatedData = {
            nama: nama !== undefined ? nama : currentData.nama,
            spesialis: spesialis !== undefined ? spesialis : currentData.spesialis,
            no_hp: no_hp !== undefined ? no_hp : currentData.no_hp,
            email: email !== undefined ? email : currentData.email,
            profile_picture: profilePictureUrl,
        };

        // Enkripsi data sebelum menyimpan
        const encryptedData = encryptData(updatedData);

        await docRef.update({ data: encryptedData });

        res.status(200).json({
            message: 'Doctor updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Delete doctor by ID
exports.deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('doctors').doc(id).delete();

        res.status(200).json({
            message: 'Doctor deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};
