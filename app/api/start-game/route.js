import { selectRounds } from "@/src/selectRounds";

export async function GET() {
  const rounds = selectRounds(5);

  // убираем правильные координаты (чтобы игрок не видел)
  const safeRounds = rounds.map((r) => ({
    id: r.id,
    image: r.image_name,
  }));

  return Response.json({
    rounds: safeRounds,
  });
}
