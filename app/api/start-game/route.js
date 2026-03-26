import { selectRounds } from "@/src/selectRounds";

function parseMode(searchParams) {
  const type = searchParams.get("type");

  if (type === "daily") {
    return { type: "daily" };
  }

  if (type === "category") {
    return {
      type: "category",
      category: String(searchParams.get("category") || "")
        .trim()
        .toLowerCase(),
    };
  }

  if (type === "difficulty") {
    return {
      type: "difficulty",
      difficulty: Number(searchParams.get("difficulty")),
    };
  }

  if (type === "decade") {
    return {
      type: "decade",
      decadeStart: Number(searchParams.get("decadeStart")),
    };
  }

  return { type: "default" };
}

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = parseMode(searchParams);

    const rounds = selectRounds({
      mode,
      count: 5,
    });

    const safeRounds = rounds.map((round) => ({
      id: String(round.id),
      image: String(round.image_name || "").trim(),
    }));

    return Response.json({
      rounds: safeRounds,
      mode,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Не удалось подготовить игру",
        details: String(error?.message || error),
      },
      { status: 500 }
    );
  }
}
