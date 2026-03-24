import { selectRounds } from "@/src/selectRounds";

export async function GET() {
  try {
    const rounds = selectRounds(5);

    const safeRounds = rounds.map((r) => ({
      id: String(r.id),
      image: String(r.image_name || "").trim(),
    }));

    return Response.json({ rounds: safeRounds });
  } catch (error) {
    console.error("start-game error:", error);

    return Response.json(
      {
        error: "Не удалось подготовить игру",
        details: String(error?.message || error),
      },
      { status: 500 }
    );
  }
}
