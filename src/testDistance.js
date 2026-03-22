const { calculateDistance } = require("./calculateDistance");

const correctLat = 59.9343;
const correctLng = 30.3351;

const userLat = 59.9386;
const userLng = 30.3141;

const distance = calculateDistance(correctLat, correctLng, userLat, userLng);

console.log("DISTANCE_KM:", distance);
console.log("DISTANCE_KM_ROUNDED:", distance.toFixed(2));
