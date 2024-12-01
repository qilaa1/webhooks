const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');  // Pastikan menggunakan node-fetch versi 2
require('dotenv').config();

const app = express();

// Middleware untuk mengurai body JSON
app.use(bodyParser.json());

// Menyajikan folder public sebagai folder statis
app.use(express.static('public'));

// Halaman tampilan untuk root URL, mengarahkan ke file HTML
app.get('/', (_req, res) => {
    res.sendFile(__dirname + '/public/i9f8l68mgzw2cl4cx944iw3rvb514g.html');
});

// Token akses Instagram Graph API Anda (pastikan token ini valid dan sesuai)
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Fungsi untuk membalas komentar
const replyToComment = async (commentId, message, accessToken) => {
    const replyUrl = `https://graph.facebook.com/v21.0/${commentId}/comments?access_token=${accessToken}`;
    
    const response = await fetch(replyUrl, {
        method: 'POST',
        body: JSON.stringify({ message: message }),
        headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    return data;
};

// Endpoint untuk menangani data komentar dari Instagram
app.post('/webhook', (req, res) => {
    console.log('Menerima data webhook:');
    console.log(JSON.stringify(req.body, null, 2));  // Menampilkan data webhook yang diterima

    // Memeriksa apakah data berkaitan dengan komentar
    if (req.body.field === 'comments') {
        const comment = req.body.value;  // Mengambil data komentar dari webhook

        console.log('Komentar diterima:');
        console.log(`Komentar ID: ${comment.id}`);
        console.log(`Dari pengguna: ${comment.from.username}`);

        // Membalas komentar dengan pesan otomatis
        replyToComment(comment.id, 'Terima kasih atas komentar Anda!', ACCESS_TOKEN)
            .then(response => {
                console.log('Komentar berhasil dibalas:', response);
                res.status(200).send('Komentar berhasil dibalas');
            })
            .catch(error => {
                console.error('Error membalas komentar:', error);
                res.status(500).send('Gagal membalas komentar');
            });
    } else {
        res.status(200).send('Webhook diterima');
    }
});

// Menjalankan aplikasi pada port 3000 (Vercel akan memilih port otomatis)
module.exports = app;
