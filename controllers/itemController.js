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



// Upload file to Google Cloud Storage
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Check if the file is an image
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).send('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on('error', (err) => res.status(500).send(err.message));

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).send({ fileUrl: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get file by filename
exports.getFile = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).send('Filename is required.');
    }

    const file = bucket.file(filename);

    // Check if the file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).send('File not found.');
    }

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    res.status(200).send({ fileUrl: publicUrl });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
