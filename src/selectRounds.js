import { loadLocations } from "./loadData";

function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function selectRounds(count = 5) {
  const locations = loadLocations();

  if (locations.length < count) {
    throw new Error(
      `Недостаточно активных заданий: нужно ${count}, доступно ${locations.length}`
    );
  }

  const shuffled = shuffleArray(locations);
  return shuffled.slice(0, count);
}
