const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // For making API requests

const app = express();

// Middleware to parse JSON in request body
app.use(bodyParser.json());

// Define your environment variables (or use hardcoded values)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'secure_token_123'; 
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'EAA15VDr6ZCaMBO8rBveeQ9yknsjzhJh0jxdREtnjJEBfpvocC9ZAMb3nvJrzrqcEv9AIm3jZB98rBZAmEaeaFF02fW99XZArh8XWB2EZAp9Go1y22eqayoDFnZCYxAeuehqzcwaDicQpGcJr4ZBJbYYLB3QzesaPTlEtbrSelVyspM7FfxydZAxv2I1KaphBmhzZBo8HvHknPelsDMCXaX86EZD'; // Replace with your actual access token

// Endpoint for the root URL
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

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    console.log('Webhook verification successful');
    res.status(200).send(challenge);  // Send the challenge code back to Instagram
  } else {
    console.log('Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// Webhook event handler for incoming comments
app.post('/webhook', async (req, res) => {
  const data = req.body;

  // Check if the data contains the necessary information
  if (data.object === 'instagram' && data.entry) {
    const entry = data.entry[0];
    const mediaId = entry.changes[0].value.media.id;
    const commentText = entry.changes[0].value.text;
    const userId = entry.changes[0].value.from.id;

    console.log(`Received comment: "${commentText}" from user ${userId} on media ${mediaId}`);

    // Post a reply to the comment
    try {
      await postComment(mediaId, 'Thanks for the comment!'); // Replace with your desired response
      console.log('Replied to comment!');
    } catch (error) {
      console.error('Error replying to comment:', error);
    }

    res.status(200).send('OK');
  } else {
    res.status(400).send('Invalid event');
  }
});

// Function to post a comment on media
async function postComment(mediaId, message) {
  const url = `https://graph.facebook.com/v12.0/${mediaId}/comments`;
  const params = {
    method: 'POST',
    body: JSON.stringify({
      message: message,
      access_token: ACCESS_TOKEN,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, params);
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }

  return data;
}

// Start the Express server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
