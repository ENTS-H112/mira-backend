const { db, bucket } = require('../config/firebase');


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
