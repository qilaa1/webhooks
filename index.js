const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan menggunakan node-fetch versi 2

const app = express();

// Menyajikan folder public sebagai folder statis
app.use(express.static('public'));

// Halaman tampilan untuk root URL, mengarahkan ke file HTML
app.get('/', (_req, res) => {
    res.sendFile(__dirname + '/public/i9f8l68mgzw2cl4cx944iw3rvb514g.html');
});

// Middleware untuk parsing JSON pada body permintaan
// Middleware untuk parsing JSON
app.use(bodyParser.json());

// Endpoint untuk verifikasi webhook Instagram
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];  // subscribe
    const token = req.query['hub.verify_token'];  // token yang dikirim oleh Facebook
    const challenge = req.query['hub.challenge'];  // challenge yang dikirim oleh Facebook

    console.log('Verifikasi Webhook');
    console.log('Mode:', mode);
    console.log('Token:', token);
    console.log('Challenge:', challenge);

    // Memeriksa token verifikasi
    if (mode && token === VERIFY_TOKEN) {
        console.log('Verifikasi Berhasil');
        res.status(200).send(challenge);  // Mengembalikan challenge untuk verifikasi
    } else {
        console.log('Token Tidak Cocok');
        res.status(403).send('Token verifikasi tidak cocok');  // Jika token tidak cocok
    }
});

// Endpoint untuk menangani data komentar dari Instagram
app.post('/webhook', (req, res) => {
    console.log('Menerima data webhook:');
    console.log(JSON.stringify(req.body, null, 2));  // Menampilkan data webhook yang diterima

    // Memeriksa apakah data berkaitan dengan komentar
    if (req.body.field === 'comments') {
        const comment = req.body.value;  // Mengambil data komentar dari webhook

        console.log('Komentar diterima:');
        console.log(`Komentar ID: ${comment.id}`);
        console.log(`Dari pengguna: ${comment.from.username} (${comment.from.id})`);
        console.log(`Komentar: ${comment.text}`);
    }

    // Mengirimkan respons status OK ke Facebook untuk memberitahukan bahwa webhook telah diterima
    res.status(200).send('Webhook diterima');
});

// Tentukan port untuk aplikasi Anda
const PORT = process.env.PORT || 4000;  // Hanya deklarasikan PORT sekali
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
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
