export function scoreRound(distanceKm) {
  if (distanceKm <= 0.1) return 5000;
  if (distanceKm <= 0.5) return 4500;
  if (distanceKm <= 1) return 4000;
  if (distanceKm <= 3) return 3000;
  if (distanceKm <= 5) return 2000;
  if (distanceKm <= 10) return 1000;
  if (distanceKm <= 20) return 500;
  return 0;
}
