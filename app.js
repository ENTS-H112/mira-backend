// app.js
const express = require('express');
const bodyParser = require('body-parser');
const itemRoutes = require('./routes/itemRoutes');


const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', itemRoutes);

app.get('/', (req, res) => {
    res.send({
        message: 'Welcome to the MIRA API V2',
        description: 'This API is used for managing appointments and patients data',
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