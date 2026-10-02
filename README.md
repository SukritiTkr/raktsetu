# RaktSetu

**Right donor. Right request. Right time.**
Blood and donors exist, but cannot find each other. RaktSetu connects verified donors with verified requests, from hospitals, NGOs and families, through WhatsApp and a simple app.

Built for **Samadhan 2026 · Upay NGO · Track 3: Community-Centric Engagement**
Author: Sukriti Thakur (Tech & AI)

## What is in this repo
| Path | What it is |
|---|---|
| `whatsapp-bot/` | Standalone WhatsApp chatbot demo (HTML/CSS/JS, no build step) |
| `app/` | Standalone app demo: Requester, Donor and Hospital/NGO views |
| `server/` | Node.js starter: matching engine and WhatsApp Cloud API webhook skeleton |
| `docs/` | Matching logic and architecture notes |
| `.github/workflows/pages.yml` | Auto-deploys the demos to GitHub Pages |

## Run the demos
No install needed. From the repo root:
```bash
python3 -m http.server 8080
# open http://localhost:8080
```
Or just open `whatsapp-bot/index.html` or `app/index.html` in a browser.

## Demo features
**WhatsApp bot**
- Natural-language requests ("Need 2 units of O+ at AIIMS urgently") with slot filling
- Request verification (partner hospital list, manual NGO path)
- AI-style scoring and 3-wave matching with live donor statuses
- Consent-based contact sharing, live tracking, rating
- Donor registration with health screening and 90-day eligibility
- "Under the hood" panel: parsed intent, score breakdown, engine log

**App**
- Requester: request form, live radar of donors, progress stepper, top matches
- Donor: eligibility ring, availability toggle, accept/decline alert, mark donated
- Hospital/NGO: KPIs, request queue with Verify, blood inventory, activity feed
- All three views share one live state

## Deploy to GitHub Pages
1. Push to a repo's `main` branch.
2. Settings → Pages → Source: **GitHub Actions**.
3. The workflow publishes the site; the URL appears in the Actions run.

## Server starter (optional)
```bash
cd server && npm install
cp .env.example .env   # fill in WhatsApp Cloud API values
npm start
```
The webhook is an untested skeleton. It needs a Meta developer app, a WhatsApp Business number and a public HTTPS URL.

## Pilot plan (from the pitch)
One city, 2–3 organisations, 300–500 donors, 60 days. Weeks 1–2 onboarding and coordinator training, weeks 3–6 live pilot with wave matching, weeks 7–8 measurement and handover. Estimated pilot budget: ₹46,000.

## Limitations
Everything in the demos is simulated in the browser with fictional donors. No real data, auth, database or messaging. See `docs/ARCHITECTURE.md` for the production path.

## License
MIT
