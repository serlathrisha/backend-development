const express = require('express');

const app = express();

// Home route
app.get('/', (req, res) => {
    res.status(200).send('Welcome to Node.js and Express Server!');
});

// About route
app.get('/about', (req, res) => {
    res.status(200).json({
        name: 'Thrisha',
        section: 'GEN AI 112'
    });
});

// Time route
app.get('/time', (req, res) => {
    res.status(200).json({
        currentDateTime: new Date()
    });
});

// 404 route
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// Start server
app.listen(3000, () => {
    console.log('Express server running at http://localhost:3000');
});