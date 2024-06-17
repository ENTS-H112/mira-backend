const express = require('express');
const bodyParser = require('body-parser');
const itemRoutes = require('./routes/itemRoutes');
const { login } = require('./controllers/login');


const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', itemRoutes);

app.get('/', (req, res) => {
    res.send({
        message: 'Welcome to the MIRA API',
        description: 'This API is used for managing appointments and patients data',
        endpoints: {
            login: '/login',
            register: '/register',
            addDoctor: '/doctor',
            getDoctors: '/doctors',
            getDoctor: '/doctor/:id',
            updateDoctor: '/doctor/:id',
            deleteDoctor: '/doctor/:id',
            getUser: '/user',
            updateProfile: '/user',
            addAppointment: '/add',
            getAppointments: '/appointments',
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
        lastUpdate: 'Wednesday, 17th June 2024 10:30 AM',
        logs: [
            {
                date: 'Wednesday, 17th June 2024',
                time: '10:30 AM',
                action: 'Update', 
                description: 'Add new refresh token  logic in login controller to handle expired token.'  
            }
        ]
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
