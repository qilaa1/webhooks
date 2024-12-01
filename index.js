const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan menggunakan node-fetch versi 2

const app = express();

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'secure_token_123'; // Token verifikasi Anda
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'AbxLzoYCOykuqbjR'; // Token akses Instagram Graph API Anda
const BUSINESS_ACCOUNT_ID = '473828995815534'; // ID Bisnis Instagram Anda

// Endpoint untuk verifikasi webhook Instagram
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.status(403).send('Error, invalid token');
    }
});

// Fungsi untuk mengambil semua postingan dari Instagram Business Account
const getAllPosts = async () => {
    const url = `https://graph.facebook.com/v12.0/${BUSINESS_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,timestamp&access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
};

// Fungsi untuk mengambil komentar dari postingan tertentu
const getComments = async (mediaId) => {
    const url = `https://graph.facebook.com/v12.0/${mediaId}/comments?access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
};

// Fungsi untuk membalas komentar
const replyToComment = async (commentId) => {
    const replyUrl = `https://graph.facebook.com/v12.0/${commentId}/replies`;
    const message = 'Terima kasih sudah berkomentar!'; // Pesan balasan
    const response = await fetch(replyUrl, {
        method: 'POST',
        body: JSON.stringify({
            message: message,
            access_token: ACCESS_TOKEN,
        }),
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    console.log(`Replied to comment ID: ${commentId}`, data);
};

// Fungsi utama untuk mengambil semua postingan dan membalas komentar terbaru
const fetchAndReplyComments = async () => {
    try {
        // Ambil semua postingan
        const posts = await getAllPosts();

        // Untuk setiap postingan, ambil semua komentar dan balas komentar terbaru
        for (const post of posts) {
            const comments = await getComments(post.id);
            
            // Jika ada komentar baru, balas komentar pertama
            if (comments.length > 0) {
                const latestComment = comments[0]; // Komentar pertama dalam daftar (terbaru)
                console.log('Newest comment:', latestComment.text);
                await replyToComment(latestComment.id); // Balas komentar terbaru
            }
        }
    } catch (error) {
        console.error('Error fetching posts or comments:', error);
    }
};

// Endpoint untuk menerima webhook Instagram
app.post('/webhook', (req, res) => {
    const data = req.body;

    if (data && data.entry) {
        // Ambil ID media dan komentar terbaru
        const { id: mediaId, changes } = data.entry[0];

        if (changes && changes[0] && changes[0].field === 'comments') {
            const commentData = changes[0].value;
            console.log('New comment received:', commentData.text);

            // Balas komentar yang baru saja diterima
            replyToComment(commentData.id);
        }
    }

    // Kirim respons 200 OK untuk Instagram webhook
    res.status(200).send('Event received');
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Panggil fungsi untuk mengambil postingan dan membalas komentar terbaru
    fetchAndReplyComments(); // Hanya panggil ini sekali setelah server berjalan, atau bisa dijadwalkan
});
