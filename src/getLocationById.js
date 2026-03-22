const { loadLocations } = require("./loadData");

function getLocationById(id) {
  const locations = loadLocations();
  return locations.find((item) => String(item.id) === String(id));
}

module.exports = { getLocationById };
