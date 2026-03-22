const { selectRounds } = require("./selectRounds");
const { calculateDistance } = require("./calculateDistance");
const { scoreRound } = require("./scoreRound");

// берём 1 случайное задание
const round = selectRounds(1)[0];

// имитация ответа игрока (пока вручную)
const userAnswer = {
  lat: 59.9386,
  lng: 30.3141,
};

// правильный ответ
const correctLat = Number(round.lat);
const correctLng = Number(round.lng);

// считаем расстояние
const distance = calculateDistance(
  correctLat,
  correctLng,
  userAnswer.lat,
  userAnswer.lng
);

// считаем очки
const score = scoreRound(distance);

// результат раунда
const result = {
  image: round.image_name,
  correct: {
    lat: correctLat,
    lng: correctLng,
  },
  user: userAnswer,
  distanceKm: Number(distance.toFixed(2)),
  score,
};

console.log("ROUND RESULT:");
console.log(result);
