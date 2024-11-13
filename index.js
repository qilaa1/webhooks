const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pastikan menggunakan node-fetch versi 2

const app = express();

// Middleware untuk parsing JSON pada body permintaan
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'secure_token_123'; // Gunakan environment variable untuk token
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'EAA15VDr6ZCaMBO2wqiOGTZCPWD9UVLRZCDWBkcbnXfmLqaBEW7NWTqwyNxTwnqPu5lbUlXes8JpOD9XmBZC2FD5nsXyh3KWILjaz3loQX2Tx2J66d3mfysbfth1NotZCKH3aAsAOpMGsAoWkIvncnZBBNNwrjxzLq5i4nFWbzLK4cM6YbpXH2E0RYyGCJxVyplIdZCfRqIVIMRsqxY5ZAS11mp3v1wZDZD'; // Simpan Access Token di environment variable

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

// Endpoint untuk verifikasi webhook saat setup
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Periksa token dan mode
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge); // Kirim challenge kembali untuk verifikasi
    } else {
        console.error("WEBHOOK_VERIFICATION_FAILED");
        res.sendStatus(403); // Token salah atau mode tidak sesuai
    }
});

// Endpoint untuk menerima notifikasi webhook
app.post('/webhook', async (req, res) => {
    try {
        console.log('Webhook event received:', JSON.stringify(req.body, null, 2));

        if (!req.body || !req.body.entry) {
            console.error("Invalid webhook payload");
            return res.sendStatus(400);
        }

        const changes = req.body.entry[0].changes;
        if (!changes) {
            console.error("No changes found in webhook payload");
            return res.sendStatus(400);
        }

        // Proses setiap perubahan (field `comments`)
        for (const change of changes) {
            if (change.field === 'comments') {
                const commentId = change.value.id; // ID komentar baru
                const replyMessage = "Terima kasih atas komentarnya!"; // Pesan balasan

                console.log(`Processing comment ID: ${commentId}`);

                // Kirim balasan otomatis ke komentar
                const response = await fetch(`https://graph.facebook.com/v21.0/${commentId}/replies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: replyMessage,
                        access_token: ACCESS_TOKEN // Access Token diambil dari environment variable
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Reply sent successfully:', data);
                } else {
                    console.error('Error sending reply:', data.error);
                }
            }
        }

        // Kirim respons sukses ke Meta
        res.sendStatus(200);
    } catch (error) {
        console.error('Error handling webhook event:', error);
        res.sendStatus(500); // Kirim respons error jika terjadi masalah
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Webhook server is running on port ${PORT}`);
});
