const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan menggunakan node-fetch versi 2

const app = express();

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'secure_token_123'; // Gunakan environment variable untuk token
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'IGQWRNVE00dGZAVZA3drZAnBaNmItTUJCaGNtalRTN3BSVFRaM0h2Y05LMnBSOGx5bVJ0bFpDeU9qRm5KSjdPSlF4VmhGUDU0OU81b3QwMENzVjJEdGI4U2o4VTNkY3ZABZA25EZAXNhUVpIeVM1VWxoWWRydnpEVnptZAzQZD'; // Ganti dengan token Anda

// Halaman tampilan untuk root URL
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Instagram Webhook Server</title>
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

// Endpoint untuk verifikasi webhook Instagram
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verifikasi token yang diterima
    if (mode && token === VERIFY_TOKEN) {
        console.log('Webhook verification successful');
        res.status(200).send(challenge);
    } else {
        console.log('Webhook verification failed');
        res.status(403).send('Forbidden');
    }
});

// Endpoint untuk menerima webhook event
app.post('/webhook', async (req, res) => {
    const data = req.body;

    // Pastikan data yang diterima valid
    if (data && data.entry && Array.isArray(data.entry)) {
        data.entry.forEach(entry => {
            // Logika untuk memproses setiap entri (misalnya event baru)
            entry.changes.forEach(async (change) => {
                console.log('Received change:', change);

                // Contoh: Jika ada postingan baru atau perubahan pada postingan
                if (change.field === 'media') {
                    const mediaId = change.value.id;  // ID media (postingan)
                    const caption = 'Thanks for the post!';  // Komentar balasan

                    // Mengirim komentar ke media
                    await postCommentToInstagram(mediaId, caption);
                }
            });
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.status(400).send('Bad Request');
    }
});

// Fungsi untuk mengirim komentar ke media Instagram
const postCommentToInstagram = async (mediaId, message) => {
    const url = `https://graph.facebook.com/v12.0/${mediaId}/comments?access_token=${ACCESS_TOKEN}`;
    const body = JSON.stringify({ message });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });

        if (response.ok) {
            console.log('Komentar berhasil dikirim');
        } else {
            console.error('Gagal mengirim komentar:', response.status, await response.text());
        }
    } catch (error) {
        console.error('Error saat mengirim komentar:', error);
    }
};

// Mulai server
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
