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


// Rute untuk Privacy Policy
app.get('/privacy_policy', (_req, res) => {
    res.sendFile(__dirname + '/public/privacy_policy.html');
});
});
  
// Token akses Instagram Graph API Anda (pastikan token ini valid dan sesuai)
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Fungsi untuk membalas komentar
const replyToComment = async (commentId, message, ACCESS_TOKEN) => {
    const replyUrl = `https://graph.facebook.com/v21.0/${commentId}/comments?access_token=${ACCESS_TOKEN}`;
    
    const response = await fetch(replyUrl, {
        method: 'POST',
        body: JSON.stringify({ message: message }),
        headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    return data;
};

// Endpoint untuk menangani data komentar dari Instagram
app.post('/webhook', async (req, res) => {
    console.log('Menerima data webhook:');
    console.log(JSON.stringify(req.body, null, 2));  // Menampilkan data webhook yang diterima

    // Memeriksa apakah data berkaitan dengan komentar
    if (req.body.entry && req.body.entry[0].changes) {
        const changes = req.body.entry[0].changes;

        for (let change of changes) {
            if (change.field === 'comments') {
                const comment = change.value;  // Mengambil data komentar dari webhook

                console.log('Komentar diterima:');
                console.log(`Komentar ID: ${comment.comment_id}`);
                console.log(`Dari pengguna: ${comment.from.username}`);
                console.log(`Isi komentar: ${comment.message}`);

                // Menjawab komentar dengan pesan balasan
                const message = 'Terima kasih telah berkomentar!';  // Pesan balasan otomatis
                try {
                    const replyData = await replyToComment(comment.comment_id, message, ACCESS_TOKEN);
                    console.log('Balasan berhasil:', replyData);
                } catch (error) {
                    console.error('Gagal membalas komentar:', error);
                }
            }
        }
    }

    // Kirim respons OK ke Instagram webhook
    res.status(200).send('Webhook diterima');
});

// Menentukan port untuk server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
