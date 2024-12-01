const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan menggunakan node-fetch versi 2

const app = express();

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'secure_token_123'; // Token verifikasi Anda
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'EAA15VDr6ZCaMBO8rBveeQ9yknsjzhJh0jxdREtnjJEBfpvocC9ZAMb3nvJrzrqcEv9AIm3jZB98rBZAmEaeaFF02fW99XZArh8XWB2EZAp9Go1y22eqayoDFnZCYxAeuehqzcwaDicQpGcJr4ZBJbYYLB3QzesaPTlEtbrSelVyspM7FfxydZAxv2I1KaphBmhzZBo8HvHknPelsDMCXaX86EZD'; // Ganti dengan token akses Instagram Graph API Anda

// Endpoint untuk verifikasi webhook Instagram
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        console.log('Webhook verification successful');
        res.status(200).send(challenge);
    } else {
        console.log('Webhook verification failed');
        res.status(403).send('Forbidden');
    }
});

// Endpoint untuk menerima webhook event dan membalas komentar otomatis
app.post('/webhook', async (req, res) => {
    const data = req.body;

    // Pastikan ada perubahan komentar di event webhook
    if (data.entry && data.entry[0].changes) {
        const changes = data.entry[0].changes;

        // Looping setiap perubahan
        changes.forEach(async (change) => {
            if (change.field === 'comments') {
                const mediaId = change.value.media.id; // ID media yang dikomentari
                const commentId = change.value.id; // ID komentar
                const commentText = change.value.text; // Isi komentar

                console.log('Media ID:', mediaId);
                console.log('Comment ID:', commentId);
                console.log('Comment Text:', commentText);

                // Kirim balasan komentar otomatis
                const responseText = 'Terima kasih atas komentarnya!';
                await sendCommentResponse(mediaId, responseText);
            }
        });
    }

    // Kirim status OK setelah memproses
    res.status(200).send('EVENT_RECEIVED');
});

// Fungsi untuk mengirimkan komentar balasan menggunakan Instagram Graph API
async function sendCommentResponse(mediaId, responseText) {
    const url = `https://graph.facebook.com/v12.0/${mediaId}/comments`;
    const params = {
        method: 'POST',
        body: JSON.stringify({
            message: responseText,
            access_token: ACCESS_TOKEN,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        const res = await fetch(url, params);
        const data = await res.json();
        console.log('Response:', data); // Menampilkan response dari API
    } catch (error) {
        console.error('Error sending comment:', error);
    }
}

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
