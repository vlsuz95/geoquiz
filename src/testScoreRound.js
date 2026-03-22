const { scoreRound } = require("./scoreRound");

const testDistances = [0.05, 0.3, 0.8, 2, 4, 8, 15, 30];

testDistances.forEach((distance) => {
  console.log(`Distance: ${distance} km -> Score: ${scoreRound(distance)}`);
});
