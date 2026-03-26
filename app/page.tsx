"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/src/components/MapPicker"), {
  ssr: false,
});

type Round = {
  id: string;
  image: string;
};

type RoundMeta = {
  place: string;
  description: string;
  year: string | number;
  panoramaUrl: string;
};

type RoundResult = {
  id: string;
  image: string;
  correct: {
    lat: number;
    lng: number;
  };
  user: {
    lat: number;
    lng: number;
  };
  distanceKm: number;
  score: number;
  maxScore: number;
  meta?: RoundMeta;
};

type SelectedPoint = {
  lat: number;
  lng: number;
};

export default function Home() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(
    null
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [screen, setScreen] = useState<"menu" | "game">("menu");

  const [menuStep, setMenuStep] = useState<
    "root" | "category" | "difficulty" | "decade"
  >("root");

  async function startGame(params?: {
    type: "daily" | "category" | "difficulty" | "decade";
    category?: string;
    difficulty?: number;
    decadeStart?: number;
  }) {
    try {
      setIsLoading(true);
      setError("");

      const query = new URLSearchParams();

      if (params?.type) query.set("type", params.type);
      if (params?.category) query.set("category", params.category);
      if (params?.difficulty)
        query.set("difficulty", String(params.difficulty));
      if (params?.decadeStart)
        query.set("decadeStart", String(params.decadeStart));

      const res = await fetch(`/api/start-game?${query.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.details || data.error || "Не удалось начать игру.");
        return;
      }

      setRounds(data.rounds || []);
      setCurrentIndex(0);
      setResult(null);
      setSelectedPoint(null);
      setTotalScore(0);
      setMenuStep("root");
      setScreen("game");
    } catch {
      setError("Ошибка запуска игры.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitAnswer() {
    try {
      setIsLoading(true);
      setError("");

      const current = rounds[currentIndex];

      if (!current) {
        setError("Текущее задание не найдено.");
        return;
      }

      if (!selectedPoint) {
        setError("Выберите точку на карте.");
        return;
      }

      const res = await fetch("/api/submit-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: current.id,
          lat: selectedPoint.lat,
          lng: selectedPoint.lng,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Не удалось отправить ответ.");
        return;
      }

      setResult(data);
      setTotalScore((prev) => prev + data.score);
    } catch {
      setError("Ошибка отправки ответа.");
    } finally {
      setIsLoading(false);
    }
  }

  function nextRound() {
    setError("");
    setResult(null);
    setSelectedPoint(null);
    setCurrentIndex((prev) => prev + 1);
  }

  const current = rounds[currentIndex];
  const gameFinished = rounds.length > 0 && currentIndex >= rounds.length;
  const canSubmit = !!current && !!selectedPoint && !result && !isLoading;

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} м`;
    }
    return `${km.toFixed(2)} км`;
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid ButtonBorder",
    background: "ButtonFace",
    color: "ButtonText",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 600,
  };
  const primaryButton: React.CSSProperties = {
    padding: "12px 24px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
  };
  const secondaryButton: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid ButtonBorder",
    background: "ButtonFace",
    color: "ButtonText",
    fontWeight: 600,
    cursor: "pointer",
  };
  const disabledPrimaryButton: React.CSSProperties = {
    ...primaryButton,
    opacity: 0.55,
    cursor: "not-allowed",
  };
  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.55,
    cursor: "not-allowed",
  };
  const errorCard: React.CSSProperties = {
    marginTop: "16px",
    marginBottom: "16px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(220, 38, 38, 0.25)",
    background: "rgba(220, 38, 38, 0.08)",
    color: "#b91c1c",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    lineHeight: 1.5,
  };

  const errorIcon: React.CSSProperties = {
    flexShrink: 0,
    width: "24px",
    height: "24px",
    borderRadius: "999px",
    background: "rgba(220, 38, 38, 0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 700,
  };

  const errorText: React.CSSProperties = {
    margin: 0,
    flex: 1,
  };
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "linear-gradient(180deg, Canvas, Canvas 200px, ButtonFace)",
        color: "CanvasText",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "Canvas",
          border: "1px solid ButtonBorder",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/*    <h1 style={{ marginBottom: "24px", textAlign: "center" }}>Geo Quiz</h1> */}

        {screen === "menu" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {menuStep === "root" && (
              <>
                <button
                  onClick={() => startGame({ type: "daily" })}
                  disabled={isLoading}
                  style={isLoading ? disabledPrimaryButton : primaryButton}
                >
                  {isLoading ? "Загрузка..." : "Ежедневный режим"}
                </button>

                <button
                  onClick={() => setMenuStep("category")}
                  style={secondaryButton}
                >
                  По категориям
                </button>

                <button
                  onClick={() => setMenuStep("difficulty")}
                  style={secondaryButton}
                >
                  По сложности
                </button>

                <button
                  onClick={() => setMenuStep("decade")}
                  style={secondaryButton}
                >
                  По десятилетиям
                </button>
              </>
            )}

            {menuStep === "category" && (
              <>
                <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>
                  Режим: по категориям
                </p>
                <p style={{ marginTop: 0 }}>
                  Выбери тематический набор фотографий:
                </p>

                <button
                  onClick={() =>
                    startGame({ type: "category", category: "tramway" })
                  }
                  style={secondaryButton}
                >
                  Трамваи
                </button>

                <button
                  onClick={() =>
                    startGame({ type: "category", category: "street" })
                  }
                  style={secondaryButton}
                >
                  Улицы
                </button>

                <button
                  onClick={() =>
                    startGame({ type: "category", category: "trolleybus" })
                  }
                  style={secondaryButton}
                >
                  Троллейбусы
                </button>

                <button
                  onClick={() =>
                    startGame({ type: "category", category: "railway" })
                  }
                  style={secondaryButton}
                >
                  Железная дорога
                </button>

                <button
                  onClick={() => setMenuStep("root")}
                  style={secondaryButton}
                >
                  Назад
                </button>
              </>
            )}

            {menuStep === "difficulty" && (
              <>
                <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>
                  Режим: по сложности
                </p>
                <p style={{ marginTop: 0 }}>
                  Выбери уровень сложности от 1 до 5.
                </p>

                {[1, 2, 3, 4, 5].map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() =>
                      startGame({ type: "difficulty", difficulty })
                    }
                    style={secondaryButton}
                  >
                    Сложность {difficulty}
                  </button>
                ))}

                <button
                  onClick={() => setMenuStep("root")}
                  style={secondaryButton}
                >
                  Назад
                </button>
              </>
            )}

            {menuStep === "decade" && (
              <>
                <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>
                  Режим: по десятилетиям
                </p>
                <p style={{ marginTop: 0 }}>Выбери десятилетие:</p>

                {[1990, 2000].map((decadeStart) => (
                  <button
                    key={decadeStart}
                    onClick={() => startGame({ type: "decade", decadeStart })}
                    style={secondaryButton}
                  >
                    {decadeStart}-е
                  </button>
                ))}

                <button
                  onClick={() => setMenuStep("root")}
                  style={secondaryButton}
                >
                  Назад
                </button>
              </>
            )}
          </div>
        )}
        {screen === "game" && rounds.length > 0 && !gameFinished && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              fontWeight: 500,
            }}
          >
            <span style={{ fontWeight: 600 }}>
              Раунд {currentIndex + 1} / {rounds.length}
            </span>

            <span>Очки: {totalScore}</span>
          </div>
        )}

        {error && (
          <div style={errorCard} role="alert" aria-live="polite">
            <div style={errorIcon}>!</div>
            <p style={errorText}>{error}</p>
          </div>
        )}

        {screen === "game" && current && !gameFinished && (
          <section style={{ marginTop: "20px" }}>
            {current.image && (
              <div style={{ marginBottom: "16px" }}>
                <img
                  src={`/images/${current.image}`}
                  alt={`Раунд ${currentIndex + 1}`}
                  style={{
                    width: "100%",
                    maxWidth: "720px",
                    height: "auto",
                    borderRadius: "12px",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              </div>
            )}

            <p style={{ marginBottom: "12px" }}>
              Выбери точку на карте, где сделана фотография!
            </p>

            <MapPicker
              selectedPoint={selectedPoint}
              correctPoint={result?.correct || null}
              distanceKm={result?.distanceKm || null}
              isLocked={!!result}
              onSelect={setSelectedPoint}
            />

            {!result && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={submitAnswer}
                  disabled={!canSubmit}
                  style={
                    canSubmit
                      ? { ...secondaryButton, marginTop: "16px" }
                      : { ...disabledButtonStyle, marginTop: "16px" }
                  }
                >
                  {isLoading ? "Проверяем..." : "Отправить ответ"}
                </button>
              </div>
            )}
          </section>
        )}

        {screen === "game" && result && (
          <section
            style={{
              marginTop: "24px",
              padding: "16px",
              border: "1px solid ButtonBorder",
              borderRadius: "12px",
              background: "Canvas",
              color: "CanvasText",
            }}
          >
            <p>Расстояние: {formatDistance(result.distanceKm)}</p>
            <p>
              Очки за раунд: {result.score} / {result.maxScore}
            </p>

            {result.meta && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  border: "1px solid ButtonBorder",
                  borderRadius: "12px",
                  background: "Field",
                  color: "FieldText",
                }}
              >
                {result.meta.description && (
                  <p
                    style={{
                      marginBottom: "12px",
                      lineHeight: 1.6,
                    }}
                  >
                    {result.meta.description}
                  </p>
                )}

                {result.meta.place && (
                  <p style={{ marginBottom: "6px" }}>
                    <strong>Адрес:</strong> {result.meta.place}
                  </p>
                )}

                {result.meta.year && (
                  <p>
                    <strong>Год снимка:</strong> {result.meta.year}
                  </p>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={nextRound}
                style={{ ...secondaryButton, marginTop: "16px" }}
              >
                Следующий раунд
              </button>
            </div>
          </section>
        )}

        {screen === "game" && gameFinished && (
          <section style={{ marginTop: "24px", textAlign: "center" }}>
            <h2>Игра окончена</h2>
            <p>Итоговый счёт: {totalScore}</p>
            <button
              onClick={() => {
                setRounds([]);
                setCurrentIndex(0);
                setResult(null);
                setSelectedPoint(null);
                setTotalScore(0);
                setError("");
                setMenuStep("root");
                setScreen("menu");
              }}
              style={primaryButton}
            >
              В меню режимов
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
