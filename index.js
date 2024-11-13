const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Verifikasi Token saat Setup
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = 'secure_token_123';

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Endpoint untuk menerima notifikasi
app.post('/webhook', (req, res) => {
    console.log('Webhook event received:', req.body);
    res.sendStatus(200);
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook server is running on port ${PORT}`);
});
