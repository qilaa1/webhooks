const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan menggunakan node-fetch versi 2

const app = express();

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'secure_token_123'; // Token verifikasi Anda
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'EAA15VDr6ZCaMBO0HjTyCsVaMrCsIhj678fY4NUi6TpeRPluy0soBWNmA8PznTtI2bfZAQlfXGvgKw1ZAsQDNLNxu8jFCsqCgPZAmr1hxLKh3QHSOV7GhoH4TO574T1aowpAYo5WRRw4DZCxuWCuvXtqscls4sQyJvEOykSWNVvpAd08B8t3SSuh0qMFkTFVShYleyRjlzL5VZCE9Yt0gZDZD'; // Token akses Instagram Graph API Anda

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
    
    // Pastikan data yang diterima berisi perubahan komentar
    if (data.object === 'instagram' && data.entry && data.entry[0].changes) {
        const changes = data.entry[0].changes;

        changes.forEach(async (change) => {
            if (change.field === 'comments') {
                const comment = change.value;
                const mediaId = comment.media.id;
                const commentId = comment.id;
                const commentText = comment.text;
                const userId = comment.from.id;

                // Log komentar yang diterima
                console.log(`Received comment: "${commentText}" from user ${userId} on media ${mediaId}`);

                // Kirim komentar balasan
                const replyText = "Thanks for your comment!"; // Pesan balasan
                await sendCommentReply(mediaId, commentId, replyText);
            }
        });
    }

    // Kirim response ke Instagram (500 OK)
    res.sendStatus(200);
});
// Fungsi untuk membalas komentar
async function replyToComment(mediaId, commentId) {
    const url = `https://graph.facebook.com/v21.0/18049023526985234/comments?access_token=EAA15VDr6ZCaMBOZB8Qz0VAzdIrDlADbzeCLsaFckK5cvx0GpfHXT8plVSNEs3IrRdr1mENRPlTOPKd6a2G1Q3lPTIchTqS7xSnehz9CEp1kr7JTNMERtQZApwsvFMoeuEVpT2r9C0159OOJKd8OipnvrzQ1VWO3TfUbTFw0qO5evJEm7XxQuZAV8YTF5LQLX`;
    const body = {
        message: 'Thanks for the comment!', // Teks balasan
        access_token: EAA15VDr6ZCaMBO0HjTyCsVaMrCsIhj678fY4NUi6TpeRPluy0soBWNmA8PznTtI2bfZAQlfXGvgKw1ZAsQDNLNxu8jFCsqCgPZAmr1hxLKh3QHSOV7GhoH4TO574T1aowpAYo5WRRw4DZCxuWCuvXtqscls4sQyJvEOykSWNVvpAd08B8t3SSuh0qMFkTFVShYleyRjlzL5VZCE9Yt0gZDZD, // Token akses Instagram Graph API
    };

    // Mengirim balasan menggunakan POST request
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log('Successfully replied to comment', responseData);
        } else {
            console.error('Failed to reply to comment', responseData);
        }
    } catch (error) {
        console.error('Error replying to comment:', error);
    }
}

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
