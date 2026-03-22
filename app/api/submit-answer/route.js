const { getLocationById } = require("../../../src/getLocationById");
const { calculateDistance } = require("../../../src/calculateDistance");
const { scoreRound } = require("../../../src/scoreRound");

export async function POST(request) {
  try {
    const body = await request.json();

    const { id, lat, lng } = body;

    if (!id || lat === undefined || lng === undefined) {
      return Response.json(
        { error: "Нужны поля id, lat, lng" },
        { status: 400 }
      );
    }

    const location = getLocationById(id);

    if (!location) {
      return Response.json({ error: "Задание не найдено" }, { status: 404 });
    }

    const correctLat = Number(location.lat);
    const correctLng = Number(location.lng);
    const userLat = Number(lat);
    const userLng = Number(lng);

    const distance = calculateDistance(
      correctLat,
      correctLng,
      userLat,
      userLng
    );

    const score = scoreRound(distance);

    return Response.json({
      id: location.id,
      image: location.image_name,
      correct: {
        lat: correctLat,
        lng: correctLng,
      },
      user: {
        lat: userLat,
        lng: userLng,
      },
      distanceKm: Number(distance.toFixed(2)),
      score,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Ошибка обработки ответа",
        details: String(error.message || error),
      },
      { status: 500 }
    );
  }
}
