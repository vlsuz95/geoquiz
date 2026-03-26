import fs from "fs";
import path from "path";

const DEFAULT_DATASET = "locations_test2.csv";
const filePath = path.join(process.cwd(), "data", DEFAULT_DATASET);

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function toBoolean(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeCategory(raw) {
  const value = String(raw || "")
    .trim()
    .toLowerCase();

  const map = {
    tramway: "tramway",
    trolleybus: "trolleybus",
    street: "street",
    railway: "railway",
    building: "building",
  };

  return map[value] || value;
}

export function loadLocations() {
  const file = fs.readFileSync(filePath, "utf-8");
  const rows = file
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    return [];
  }

  const headers = parseCSVLine(rows[0]);

  return rows
    .slice(1)
    .map((row) => {
      const values = parseCSVLine(row);
      const obj = {};

      headers.forEach((header, index) => {
        obj[header] = values[index] ?? "";
      });

      return {
        ...obj,
        id: String(obj.id || "").trim(),
        title: String(obj.title || "").trim(),
        image_name: String(obj.image_name || "").trim(),
        photo_url: String(obj.photo_url || "").trim(),
        category: normalizeCategory(obj.category),
        difficulty: toNumber(obj.difficulty),
        year: toNumber(obj.year),
        lat: toNumber(obj.lat),
        lng: toNumber(obj.lng),
        is_active: toBoolean(obj.is_active),
        is_daily: toBoolean(obj.is_daily),
      };
    })
    .filter((location) => location.is_active);
}
