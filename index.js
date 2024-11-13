const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

// Port dari environment variable (untuk deployment) atau default ke 4000
const PORT = process.env.PORT || 4000;

// Halaman tampilan untuk root URL
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Webhook Server</title>
            </head>
            <body>
                <h1>Instagram Webhook Server</h1>
                <p>Server for handling Instagram API webhooks.</p>
                <p>Endpoints:</p>
                <ul>
                    <li>GET /webhook - <i>Webhook verification</i></li>
                    <li>POST /webhook - <i>Receive webhook events</i></li>
                </ul>
            </body>
        </html>
    `);
});

// Endpoint untuk verifikasi webhook saat setup
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = 'secure_token_123';

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Periksa token dan mode
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge); // Kirim challenge kembali untuk verifikasi
    } else {
        res.sendStatus(403); // Token salah atau mode tidak sesuai
    }
});

// Endpoint untuk menerima notifikasi webhook
app.post('/webhook', (req, res) => {
    // Log payload yang diterima
    console.log('Webhook event received:', JSON.stringify(req.body, null, 2));

    // Kirim respons sukses ke Meta
    res.sendStatus(200);
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Webhook server is running on port ${PORT}`);
});
