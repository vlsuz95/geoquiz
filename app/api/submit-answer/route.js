import { getLocationById } from "@/src/getLocationById";
import { calculateDistance } from "@/src/calculateDistance";
import { scoreRound } from "@/src/scoreRound";

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, lat, lng } = body;

    if (!id || lat === undefined || lng === undefined) {
      return Response.json(
        { error: "Нужны поля id, lat и lng" },
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
    const difficulty = Number(location.difficulty) || 1;

    if (
      Number.isNaN(correctLat) ||
      Number.isNaN(correctLng) ||
      Number.isNaN(userLat) ||
      Number.isNaN(userLng)
    ) {
      return Response.json(
        { error: "Некорректные координаты" },
        { status: 400 }
      );
    }

    const distance = calculateDistance(
      correctLat,
      correctLng,
      userLat,
      userLng
    );

    const score = scoreRound(distance, difficulty);

    return Response.json({
      id: String(location.id),
      image: location.image_name,
      difficulty,
      maxScore: 5000 + 100 * (difficulty - 1),
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
      meta: {
        place: String(location.gt_place || "").trim(),
        description: String(location.description || "").trim(),
        year: String(location.year || "").trim(),
        panoramaUrl: String(location.looks_like_now || "").trim(),
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: "Ошибка обработки ответа",
        details: String(error?.message || error),
      },
      { status: 500 }
    );
  }
}
