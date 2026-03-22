import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "locations_test.csv");

export function loadLocations() {
  const file = fs.readFileSync(filePath, "utf-8");

  const rows = file.trim().split("\n");
  const headers = rows[0].split(",");

  const data = rows.slice(1).map((row) => {
    const values = row.split(",");

    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i]?.trim();
    });

    return obj;
  });

  return data.filter((item) => {
    const value = String(item.is_active).trim().toLowerCase();
    return value === "true" || value === "1";
  });
}
