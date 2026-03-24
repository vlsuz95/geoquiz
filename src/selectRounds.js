import fs from "fs";
import path from "path";
import { loadLocations } from "./loadData";

const imagesDir = path.join(process.cwd(), "public", "images");

function imageExists(imageName) {
  if (!imageName) return false;

  const filePath = path.join(imagesDir, imageName);
  return fs.existsSync(filePath);
}

export function selectRounds(count = 5) {
  const locations = loadLocations();

  const validLocations = locations.filter((loc) => {
    const exists = imageExists(loc.image_name);

    if (!exists) {
      console.warn("❌ Нет изображения:", loc.image_name, "| id:", loc.id);
    }

    return exists;
  });

  console.log(
    `Всего локаций: ${locations.length}, валидных: ${validLocations.length}`
  );

  const shuffled = validLocations.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}