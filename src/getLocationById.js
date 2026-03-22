import { loadLocations } from "./loadData";

export function getLocationById(id) {
  const locations = loadLocations();
  return locations.find((item) => String(item.id) === String(id));
}
