const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Menggunakan node-fetch versi 2
const app = express();

// Middleware untuk parsing JSON
app.use(bodyParser.json());

// Token akses Instagram Graph API Anda (pastikan token ini valid dan sesuai)
require('dotenv').config();
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Fungsi untuk membalas komentar
const replyToComment = async (commentId, message, accessToken) => {
    const replyUrl = `https://graph.facebook.com/v21.0/${commentId}/replies?access_token=${accessToken}`;
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
        console.log(`Dari pengguna: ${comment.from.username} (${comment.from.id})`);
        console.log(`Komentar: ${comment.text}`);

        // Mengirimkan balasan otomatis
        const replyMessage = 'Terima kasih atas komentarnya!';
        replyToComment(comment.id, replyMessage, ACCESS_TOKEN)
            .then(response => {
                console.log('Balasan berhasil dikirim:', response);
            })
            .catch(error => {
                console.error('Terjadi kesalahan saat mengirim balasan:', error);
            });
    }

    // Kirim respons status OK ke Facebook untuk memberitahukan bahwa webhook telah diterima
    res.status(200).send('Webhook diterima');
});

// Tentukan port untuk aplikasi Anda
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
y