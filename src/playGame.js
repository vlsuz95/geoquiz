const { selectRounds } = require("./selectRounds");
const { calculateDistance } = require("./calculateDistance");
const { scoreRound } = require("./scoreRound");

// берём 5 заданий
const rounds = selectRounds(5);

// имитация ответов игрока (пока одинаковые)
const userAnswers = [
  { lat: 59.9386, lng: 30.3141 },
  { lat: 59.9386, lng: 30.3141 },
  { lat: 59.9386, lng: 30.3141 },
  { lat: 59.9386, lng: 30.3141 },
  { lat: 59.9386, lng: 30.3141 },
];

let totalScore = 0;

const results = rounds.map((round, index) => {
  const user = userAnswers[index];

  const correctLat = Number(round.lat);
  const correctLng = Number(round.lng);

  const distance = calculateDistance(
    correctLat,
    correctLng,
    user.lat,
    user.lng
  );

  const score = scoreRound(distance);
  totalScore += score;

  return {
    image: round.image_name,
    correct: {
      lat: correctLat,
      lng: correctLng,
    },
    user,
    distanceKm: Number(distance.toFixed(2)),
    score,
  };
});

const gameResult = {
  rounds: results,
  totalScore,
};

console.log("GAME RESULT:");
console.log(JSON.stringify(gameResult, null, 2));
