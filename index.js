const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan menggunakan node-fetch versi 2

const app = express();

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'secure_token_123'; // Token verifikasi Anda
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'EAA15VDr6ZCaMBO8rBveeQ9yknsjzhJh0jxdREtnjJEBfpvocC9ZAMb3nvJrzrqcEv9AIm3jZB98rBZAmEaeaFF02fW99XZArh8XWB2EZAp9Go1y22eqayoDFnZCYxAeuehqzcwaDicQpGcJr4ZBJbYYLB3QzesaPTlEtbrSelVyspM7FfxydZAxv2I1KaphBmhzZBo8HvHknPelsDMCXaX86EZD'; // Token akses Instagram Graph API Anda

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

// Fungsi untuk mengirim balasan komentar
async function sendCommentReply(mediaId, commentId, replyText) {
    const url = `https://graph.facebook.com/v21.0/${mediaId}/comments`;
    const body = {
        message: replyText,
        parent_comment_id: commentId, // ID komentar yang dibalas
        access_token: ACCESS_TOKEN
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (data.error) {
            console.error('Error replying to comment:', data.error);
        } else {
            console.log('Successfully replied to comment');
        }
    } catch (error) {
        console.error('Error sending comment reply:', error);
    }
}

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
