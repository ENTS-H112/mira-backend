const { db, bucket } = require('../config/firebase');


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