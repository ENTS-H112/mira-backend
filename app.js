const express = require('express');
const bodyParser = require('body-parser');
const itemRoutes = require('./routes/itemRoutes');
const { getPatients } = require('./controllers/itemController');


const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', itemRoutes);

app.get('/', (req, res) => {
    res.send(
        {
            message: 'Welcome to the MIRA API',
            endpoints: {
                getUser: '/user',
                addAppointment: '/add',
                getPatients: '/patients',
                getPatient: '/patient/:id',
                getHistory: '/patient/:id/history',
                getNotification: '/patient/:id/notification',
                uploadFile: '/upload',
                getFile: '/file/:filename'
            },
            message: 'Last updated: 2024-06-05',
        }
    );
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
