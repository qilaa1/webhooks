const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan menggunakan node-fetch versi 2

const app = express();

// Halaman tampilan untuk root URL
app.get('/', (req, res) => {
    res.send(`Instagram Webhook Server`);
});

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'secure_token_123'; // Token verifikasi Anda
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'EAA15VDr6ZCaMBO0HjTyCsVaMrCsIhj678fY4NUi6TpeRPluy0soBWNmA8PznTtI2bfZAQlfXGvgKw1ZAsQDNLNxu8jFCsqCgPZAmr1hxLKh3QHSOV7GhoH4TO574T1aowpAYo5WRRw4DZCxuWCuvXtqscls4sQyJvEOykSWNVvpAd08B8t3SSuh0qMFkTFVShYleyRjlzL5VZCE9Yt0gZDZD'; // Token akses Instagram Graph API Anda

// Endpoint untuk verifikasi webhook Instagram
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.status(403).send('Token verifikasi tidak cocok');
    }
});

// Fungsi untuk mengambil semua postingan dari Instagram Business Account
const getAllPosts = async () => {
    const businessAccountId = '473828995815534'; // Ganti dengan ID Bisnis Instagram Anda
    const url = `https://graph.facebook.com/v12.0/${businessAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&access_token=${ACCESS_TOKEN}`;

    const response = await fetch(url);
    const data = await response.json();

    return data.data || [];
};

// Fungsi untuk mengambil komentar dari sebuah media (posting)
const getComments = async (mediaId) => {
    const url = `https://graph.facebook.com/v12.0/${mediaId}/comments?access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();

    return data.data || [];
};

// Fungsi untuk membalas komentar
const replyToComment = async (commentId, message) => {
    const replyUrl = `https://graph.facebook.com/v12.0/${commentId}/replies`;
    const response = await fetch(replyUrl, {
        method: 'POST',
        body: JSON.stringify({
            message: message,
            access_token: ACCESS_TOKEN
        }),
        headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    console.log('Replied to comment:', data);
};

// Endpoint untuk menerima webhook
app.post('/webhook', async (req, res) => {
    const entries = req.body.entry;
    entries.forEach(async entry => {
        if (entry.changes && entry.changes[0].field === 'comments') {
            const comment = entry.changes[0].value;
            const commentId = comment.id;
            const message = 'Terima kasih sudah berkomentar!'; // Pesan balasan

            // Membalas komentar
            await replyToComment(commentId, message);
        }
    });
    res.status(200).send('Event received');
});

// Mulai server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
