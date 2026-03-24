import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "locations_test2.csv");

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
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

export function loadLocations() {
  const file = fs.readFileSync(filePath, "utf-8");

  const rows = file.trim().split("\n");

  const headers = parseCSVLine(rows[0]);

  const data = rows.slice(1).map((row) => {
    const values = parseCSVLine(row);

    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });

    return obj;
  });

  return data.filter((item) => {
    const value = String(item.is_active || "")
      .trim()
      .toLowerCase();
    return value === "true" || value === "1";
  });
}
