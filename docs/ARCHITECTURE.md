# Architecture

## Demo (this repo, static)
- `whatsapp-bot/`: chat state machine. `ask()` pauses a flow until the user taps a button or types a reply. `nlu()` is regex-based entity extraction (group, units, hospital, urgency, intent).
- `app/`: one shared in-memory state `S`; three views (Requester, Donor, Hospital/NGO) render from it. Timers simulate verification and donor response.

## Production target
```
WhatsApp user -> WhatsApp Cloud API -> /webhook (server/) -> request service
App / web     -> REST API ----------------------------------^
request service -> verification (partner hospital list, NGO queue)
                -> matching (server/src/matching.js) -> notification worker
                -> DB (donors, requests, consent, audit log)
Hospital/NGO dashboard <- same API
```

## Privacy rules to keep
- Donor phone numbers are never shown to requesters before the donor accepts.
- Consent is recorded per donor; allow opt-out at any time (reply STOP).
- Health screening answers are not stored beyond eligibility status.
- Verify requests before alerting donors to limit misuse.

## Gaps vs the demo
No real database, auth, or message delivery. Donor data in the demos is fictional sample data.
