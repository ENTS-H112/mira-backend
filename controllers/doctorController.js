const { db, bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

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