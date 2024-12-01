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
app.use(bodyParser.json());

// Menggunakan token akses dari environment variables atau dapat diganti dengan token langsung
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'your_access_token_here'; // Pastikan token ini valid dan sesuai

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

// Endpoint untuk menangani data komentar live
app.post('/webhook', (req, res) => {
    console.log('Menerima data webhook:');
    console.log(JSON.stringify(req.body, null, 2));  // Menampilkan data webhook yang diterima

    if (req.body.field === 'live_comments') {
        const comment = req.body.value; // Mengambil data komentar dari webhook

        console.log('Komentar live diterima:');
        console.log(`Komentar ID: ${comment.id}`);
        console.log(`Dari pengguna: ${comment.from.username} (${comment.from.id})`);
        console.log(`Komentar: ${comment.text}`);

        // Balas komentar
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
