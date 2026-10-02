// Matching engine used by the demos, extracted as a reusable module.
export const BLOOD_GROUPS = ['O+','O-','A+','A-','B+','B-','AB+','AB-'];

// Recipient group -> donor groups that can give to it
export const COMPAT = {
  'O+': ['O+','O-'], 'O-': ['O-'],
  'A+': ['A+','A-','O+','O-'], 'A-': ['A-','O-'],
  'B+': ['B+','B-','O+','O-'], 'B-': ['B-','O-'],
  'AB+': BLOOD_GROUPS, 'AB-': ['AB-','A-','B-','O-'],
};

export const MIN_GAP_DAYS = 90; // freshness / eligibility rule

// donor: { name, group, km, lastDonatedDays, responseRate (0..1) }
export function score(donor, group) {
  const compat = donor.group === group ? 1 : 0.7;
  const distance = Math.max(0, 1 - donor.km / 10);
  const fresh = Math.min(donor.lastDonatedDays / 180, 1);
  return 0.4 * compat + 0.3 * distance + 0.2 * fresh + 0.1 * donor.responseRate;
}

export function rank(donors, group) {
  return donors
    .filter(d => COMPAT[group].includes(d.group) && d.lastDonatedDays >= MIN_GAP_DAYS)
    .map(d => ({ ...d, score: score(d, group) }))
    .sort((a, b) => b.score - a.score);
}

// Wave 1: within 4 km (max 3). Wave 2: next 4. Wave 3: NGO broadcast.
export function waves(ranked) {
  const w1 = ranked.filter(d => d.km <= 4).slice(0, 3);
  const w2 = ranked.filter(d => !w1.includes(d)).slice(0, 4);
  return { w1, w2, w3: 'ngo-broadcast' };
}
