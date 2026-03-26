import fs from "fs";
import path from "path";
import { loadLocations } from "./loadData";

const imagesDir = path.join(process.cwd(), "public", "images");

function imageExists(imageName) {
  if (!imageName) {
    return false;
  }

  return fs.existsSync(path.join(imagesDir, imageName));
}

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function seededShuffle(array, seed) {
  const copy = [...array];
  let state = seed;

  function random() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  }

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function getDaySeed(date = new Date()) {
  return Number(
    `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}${String(date.getUTCDate()).padStart(2, "0")}`
  );
}

function filterByMode(locations, mode) {
  if (!mode || !mode.type || mode.type === "default") {
    return locations;
  }

  switch (mode.type) {
    case "daily":
      return locations.filter((location) => location.is_daily);

    case "category":
      return locations.filter(
        (location) => location.category === mode.category
      );

    case "difficulty":
      return locations.filter(
        (location) => location.difficulty === mode.difficulty
      );

    case "decade":
      return locations.filter(
        (location) =>
          typeof location.year === "number" &&
          location.year >= mode.decadeStart &&
          location.year <= mode.decadeStart + 9
      );

    default:
      return locations;
  }
}

export function selectRounds({ mode = { type: "default" }, count = 5 } = {}) {
  const allLocations = loadLocations().filter((location) =>
    imageExists(location.image_name)
  );
  const filteredLocations = filterByMode(allLocations, mode);

  if (filteredLocations.length < count) {
    throw new Error(
      "Упс! У нас недостаточно материала для такой игры. Выбери другой режим, а мы постараемся добавить новые фотографии как можно скорее!"
    );
  }

  if (mode.type === "daily") {
    const seed = getDaySeed();
    return seededShuffle(filteredLocations, seed).slice(0, count);
  }

  return shuffle(filteredLocations).slice(0, count);
}
