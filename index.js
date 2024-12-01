const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan menggunakan node-fetch versi 2

const app = express();

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'secure_token_123'; // Token verifikasi Anda
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'EAA15VDr6ZCaMBO8rBveeQ9yknsjzhJh0jxdREtnjJEBfpvocC9ZAMb3nvJrzrqcEv9AIm3jZB98rBZAmEaeaFF02fW99XZArh8XWB2EZAp9Go1y22eqayoDFnZCYxAeuehqzcwaDicQpGcJr4ZBJbYYLB3QzesaPTlEtbrSelVyspM7FfxydZAxv2I1KaphBmhzZBo8HvHknPelsDMCXaX86EZD'; // Ganti dengan token akses Instagram Graph API Anda

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

    if (mode && token === VERIFY_TOKEN) {
        console.log('Webhook verification successful');
        res.status(200).send(challenge);
    } else {
        console.log('Webhook verification failed');
        res.status(403).send('Forbidden');
    }
});

// Endpoint untuk menerima webhook event (POST)
app.post('/webhook', async (req, res) => {
    const data = req.body;
    console.log('Webhook received:', JSON.stringify(data, null, 2));

    // Pastikan data komentar ada
    if (data && data.entry) {
        const entry = data.entry[0];
        const changes = entry.changes;

        // Loop untuk memeriksa perubahan komentar
        for (const change of changes) {
            if (change.field === 'comments') {
                const comment = change.value;
                const mediaId = comment.media.id;
                const commentId = comment.id;
                const userComment = comment.text;

                console.log(`New comment received: ${userComment}`);

                // Balas komentar
                const reply = `Thanks for your comment! Here's an automated response!`;

                // Kirim balasan komentar
                try {
                    const response = await fetch(
                        `https://graph.facebook.com/v12.0/${mediaId}/comments`,
                        {
                            method: 'POST',
                            body: JSON.stringify({
                                message: reply,
                                access_token: ACCESS_TOKEN,
                            }),
                            headers: { 'Content-Type': 'application/json' },
                        }
                    );
                    const result = await response.json();
                    console.log('Reply sent:', result);
                } catch (error) {
                    console.error('Error sending reply:', error);
                }
            }
        }
    }

    res.status(200).send('Event processed');
});

// Menjalankan server pada port yang ditentukan
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
