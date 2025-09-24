// Simple distance-based fare calculation
// Inputs: distanceMeters, fareRule object from DB
function computeFareCents(distanceMeters, fareRule) {
  const km = Math.max(0, distanceMeters / 1000);
  const perKm = fareRule.perKmCents;
  const base = fareRule.baseFareCents;

  // Example policy: base fare + ceil(km) * perKm
  const variable = Math.ceil(km) * perKm;
  let fare = base + variable;
  if (fare > fareRule.maxFareCents) fare = fareRule.maxFareCents;
  return fare;
}

module.exports = {
  computeFareCents
};