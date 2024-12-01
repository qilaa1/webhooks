const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan menggunakan node-fetch versi 2

const app = express();

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'secure_token_123'; // Token verifikasi Anda
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'EAA15VDr6ZCaMBO0HjTyCsVaMrCsIhj678fY4NUi6TpeRPluy0soBWNmA8PznTtI2bfZAQlfXGvgKw1ZAsQDNLNxu8jFCsqCgPZAmr1hxLKh3QHSOV7GhoH4TO574T1aowpAYo5WRRw4DZCxuWCuvXtqscls4sQyJvEOykSWNVvpAd08B8t3SSuh0qMFkTFVShYleyRjlzL5VZCE9Yt0gZDZD'; // Token akses Instagram Graph API Anda
const BUSINESS_ACCOUNT_ID = '17841470490851912'; // Ganti dengan ID bisnis Anda

// Halaman tampilan untuk root URL
app.get('/', (req, res) => {
    res.send(`Instagram Webhook Server`);
});

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
    const url = `https://graph.facebook.com/v21.0/${BUSINESS_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
};

// Fungsi untuk mengambil komentar dari postingan tertentu
const getComments = async (mediaId) => {
    const url = `https://graph.facebook.com/v21.0/${mediaId}/comments?access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
};

// Fungsi untuk membalas komentar
const replyToComment = async (commentId, message) => {
    const replyUrl = `https://graph.facebook.com/v21.0/${commentId}/replies`;
    const response = await fetch(replyUrl, {
        method: 'POST',
        body: JSON.stringify({
            message: message,
            access_token: ACCESS_TOKEN
        }),
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return data;
};

// Fungsi utama untuk mengambil semua postingan dan komentar, kemudian membalas komentar terbaru
const processAndReplyToComments = async () => {
    try {
        const posts = await getAllPosts();
        for (const post of posts) {
            const mediaId = post.id;
            const comments = await getComments(mediaId);
            
            if (comments.length > 0) {
                const latestComment = comments[comments.length - 1]; // Ambil komentar terbaru
                const message = 'Terima kasih sudah berkomentar!';
                await replyToComment(latestComment.id, message); // Membalas komentar terbaru
                console.log(`Replied to comment ID: ${latestComment.id}`);
            }
        }
    } catch (error) {
        console.error('Error processing comments:', error);
    }
};

// Memanggil fungsi untuk memproses dan membalas komentar setiap kali server dijalankan
processAndReplyToComments();

// Menjalankan server di port 4000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
