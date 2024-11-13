const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan versi node-fetch yang mendukung require

const app = express();

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

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
app.post('/webhook', async (req, res) => {
    try {
        // Ambil data dari perubahan yang diterima
        const changes = req.body.entry[0].changes;

        // Proses setiap perubahan (field `comments`)
        for (const change of changes) {
            if (change.field === 'comments') {
                const commentId = change.value.id; // ID komentar baru
                const replyMessage = "Terima kasih atas komentarnya!"; // Pesan balasan

                // Kirim balasan otomatis ke komentar
                const response = await fetch(`https://graph.facebook.com/v21.0/${commentId}/replies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: replyMessage,
                        access_token: 'EAA15VDr6ZCaMBO8xoVlIZC6Te2JHSztNufxzrNm9ecn2s208vEAGh99533nx4ORg6p5xnARiMiXeXgrnyWZCAhZAWZBVQ4kLfuM8yZAkFYQNBO1hE88v4X08X2XZC0KydDMBRZA3xZCOgrYnNkZBNHUz0kqy0npvrZACr4FVptHdN3ZBWOTXwRxJJF9bOkEp2NhGT0dGU9Y7ZB8DtwDWEZAkfvqG9vSMtmFQZDZD' // Ganti dengan Access Token Anda
                    })
                });

                const data = await response.json();
                console.log('Reply sent:', data);
            }
        }

        // Kirim respons sukses ke Meta
        res.sendStatus(200);
    } catch (error) {
        console.error('Error handling webhook event:', error);
        res.sendStatus(500); // Kirim respons error jika terjadi masalah
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Webhook server is running on port ${PORT}`);
});
