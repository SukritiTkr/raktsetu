# Matching logic

**Hard filters** (donor is dropped if any fails)
- Blood-group compatible with the recipient (`COMPAT` table).
- At least 90 days since last donation (freshness check).
- Available for alerts and has given consent.

**Score** (0 to 1)

| Factor | Weight | Definition |
|---|---|---|
| Compatibility | 0.4 | 1.0 exact group, 0.7 compatible group |
| Distance | 0.3 | `1 - km/10`, floored at 0 |
| Freshness | 0.2 | `min(daysSinceLastDonation/180, 1)` |
| Responsiveness | 0.1 | Historical reply rate |

**Waves**
1. Wave 1: top 3 within 4 km, 2 min timeout.
2. Wave 2: next 4, wider radius.
3. Wave 3: broadcast to partner NGO volunteers.

The weights are a starting point. Tune them against pilot data.
