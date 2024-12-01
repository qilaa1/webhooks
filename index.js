const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan menggunakan node-fetch versi 2

const app = express();

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'secure_token_123'; // Ganti dengan token verifikasi Anda
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'IGQWRNVE00dGZAVZA3drZAnBaNmItTUJCaGNtalRTN3BSVFRaM0h2Y05LMnBSOGx5bVJ0bFpDeU9qRm5KSjdPSlF4VmhGUDU0OU81b3QwMENzVjJEdGI4U2o4VTNkY3ZABZA25EZAXNhUVpIeVM1VWxoWWRydnpEVnptZAzQZD'; // Ganti dengan token akses Instagram Graph API Anda
const IG_USER_ID = '122105310890590854'; // Ganti dengan ID pengguna Instagram Anda

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
        // Proses setiap entri
        data.entry.forEach(entry => {
            // Cek jika perubahan berhubungan dengan komentar
            if (entry.changes && Array.isArray(entry.changes)) {
                entry.changes.forEach(change => {
                    if (change.field === 'comments') {
                        const commentData = change.value;

                        // Ekstrak ID media dan komentar
                        const mediaId = commentData.media.id; // ID media
                        const commentText = commentData.text; // Isi komentar

                        console.log(`Menerima komentar: "${commentText}" pada media ID: ${mediaId}`);

                        // Kirim komentar balasan menggunakan Graph API
                        sendInstagramComment(mediaId, "Terima kasih atas komentarnya!", ACCESS_TOKEN);
                    }
                });
            }
        });

        // Kirim respons ke Instagram agar webhook diproses dengan sukses
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.status(400).send('Bad Request');
    }
});

// Fungsi untuk mengambil semua media dan mengomentari mereka
async function commentOnAllPosts() {
    // Ambil semua media dari akun Instagram
    const mediaResponse = await fetch(`https://graph.facebook.com/v12.0/${IG_USER_ID}/media?access_token=${ACCESS_TOKEN}`);
    const mediaData = await mediaResponse.json();

    if (mediaData.data) {
        // Loop melalui semua media dan tambahkan komentar
        mediaData.data.forEach(async (media) => {
            const mediaId = media.id; // ID media untuk setiap postingan
            await sendInstagramComment(mediaId, "Komentar otomatis untuk semua postingan!", ACCESS_TOKEN);
        });
    }
}

// Fungsi untuk mengirimkan komentar ke media menggunakan Graph API
async function sendInstagramComment(mediaId, message, accessToken) {
    const response = await fetch(`https://graph.facebook.com/v12.0/${mediaId}/comments?message=${encodeURIComponent(message)}&access_token=${accessToken}`, {
        method: 'POST',
    });

    const data = await response.json();
    if (data.error) {
        console.error('Error sending comment:', data.error);
    } else {
        console.log(`Komentar berhasil ditambahkan ke media ID ${mediaId}`);
    }
}

// Jalankan server pada port yang sudah ditentukan
app.listen(PORT, () => {
    console.log(`Server berjalan pada port ${PORT}`);

    // Coba mengomentari semua postingan setiap kali server dimulai (opsional)
    commentOnAllPosts();
});
