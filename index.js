const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan menggunakan node-fetch versi 2

const app = express();
// Menyajikan folder public sebagai folder statis
app.use(express.static('public'));

// Halaman tampilan untuk root URL
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
            <meta name="facebook-domain-verification" content="i9f8l68mgzw2cl4cx944iw3rvb514g" />
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

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'secure_token_123'; // Token verifikasi Anda
require('dotenv').config();
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Endpoint untuk verifikasi webhook Instagram
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('Verifikasi Webhook');
    console.log('Mode:', mode);
    console.log('Token:', token);
    console.log('Challenge:', challenge);

    if (mode && token === VERIFY_TOKEN) {
        console.log('Verifikasi Berhasil');
        res.status(200).send(challenge);
    } else {
        console.log('Token Tidak Cocok');
        res.status(403).send('Token verifikasi tidak cocok');
    }
});

// Fungsi untuk mengambil semua postingan dari Instagram Business Account
const getAllPosts = async () => {
    const url = `https://graph.facebook.com/v21.0/${YOUR_BUSINESS_ACCOUNT_ID}/media?access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
};

// Fungsi untuk membalas komentar
const replyToComment = async (commentId, message) => {
    const replyUrl = `https://graph.facebook.com/v21.0/${commentId}/replies?access_token=${ACCESS_TOKEN}`;
    const response = await fetch(replyUrl, {
        method: 'POST',
        body: JSON.stringify({
            message: message,
        }),
        headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    return data;
};

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

