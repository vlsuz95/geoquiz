export function scoreRound(distanceKm, difficulty = 1) {
  const minDistance = 0.1; // 100 метров
  const maxDistance = 20; // 20 км

  const maxScore = 5000;
  const minScore = 10;

  const safeDifficulty = Math.min(5, Math.max(1, Number(difficulty) || 1));

  let baseScore;

  if (distanceKm <= minDistance) {
    baseScore = maxScore;
  } else if (distanceKm >= maxDistance) {
    baseScore = minScore;
  } else {
    const logMin = Math.log(minDistance);
    const logMax = Math.log(maxDistance);
    const logDistance = Math.log(distanceKm);

    const progress = (logDistance - logMin) / (logMax - logMin);
    baseScore = Math.round(maxScore - progress * (maxScore - minScore));
  }

  const difficultyBonus = distanceKm < 1 ? 100 * (safeDifficulty - 1) : 0;

  return baseScore + difficultyBonus;
}
