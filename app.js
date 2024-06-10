const express = require('express');
const bodyParser = require('body-parser');
const itemRoutes = require('./routes/itemRoutes');


const app = express();
const port = 4001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', itemRoutes);

app.get('/', (req, res) => {
    res.send({
        message: 'Welcome to the MIRA API V2',
        description: 'This API is used for managing appointments and patients data',
        endpoints: {
            addDoctor: '/doctor',
            getDoctors: '/doctors',
            getDoctor: '/doctor/:id',
            updateDoctor: '/doctor/:id',
            deleteDoctor: '/doctor/:id',
            getUser: '/user',
            updateProfile: '/user',
            addAppointment: '/add',
            getPatients: '/patients',
            getPatient: '/patient/:id',
            deletePatient: '/patient/:id',
            updatePatient: '/patient/:id',
            getHistory: '/patient/:id/history',
            getNotification: '/user/:id/notification',
            addResult: '/patient/:id/result',
            getResult: '/patient/:id/result',
            uploadFile: '/upload',
            getFile: '/file/:filename'
        },
        lastUpdate: 'Monday, 10th June 2024, 07:15 PM'
    });
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;