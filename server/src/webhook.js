// STARTER SKELETON for the WhatsApp Cloud API. Not tested against a live account.
// Needs: a Meta developer app, a WhatsApp Business number, and a public HTTPS URL for the webhook.
import express from 'express';
import { rank, waves } from './matching.js';

const { PORT = 3000, WHATSAPP_VERIFY_TOKEN, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = process.env;
const app = express();
app.use(express.json());

// TODO: replace with a real database (Postgres/Firestore). Store phone numbers securely.
const donors = [
  { name: 'Rahul Sharma', group: 'O+', km: 2.0, lastDonatedDays: 140, responseRate: 0.9 },
  { name: 'Amit Verma',   group: 'O+', km: 1.2, lastDonatedDays: 200, responseRate: 0.8 },
];

async function sendText(to, body) {
  await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
  });
}

// Webhook verification handshake
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === WHATSAPP_VERIFY_TOKEN)
    return res.status(200).send(req.query['hub.challenge']);
  res.sendStatus(403);
});

// Incoming messages
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // acknowledge immediately
  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg || msg.type !== 'text') return;
  const m = msg.text.body.match(/\b(ab|a|b|o)\s*(\+|-|pos(?:itive)?|neg(?:ative)?)/i);
  if (!m) return sendText(msg.from, 'Namaste! Tell me the blood group, e.g. "Need O+ blood at AIIMS".');
  const group = m[1].toUpperCase() + (/^n|-/i.test(m[2]) ? '-' : '+');
  const { w1 } = waves(rank(donors, group));
  await sendText(msg.from, w1.length
    ? `Found ${w1.length} eligible ${group}-compatible donors nearby. Alerting them now.`
    : 'No nearby donors yet. Alerting partner NGOs.');
  // TODO: verify request, template-message wave-1 donors, track replies, relay contact on consent.
});

app.listen(PORT, () => console.log(`RaktSetu webhook on :${PORT}`));
