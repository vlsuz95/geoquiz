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

  async function startGame() {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/start-game");
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

        {rounds.length === 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom:
                rounds.length > 0 && !gameFinished ? "16px" : "24px",
            }}
          >
            <button
              onClick={startGame}
              disabled={isLoading}
              style={isLoading ? disabledPrimaryButton : primaryButton}
            >
              {isLoading ? "Загрузка..." : "Начать игру"}
            </button>
          </div>
        )}
        {rounds.length > 0 && !gameFinished && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between", // 👈 ключевая строка
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
          <p
            style={{
              color: "crimson",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        {current && !gameFinished && (
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

        {result && (
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

        {gameFinished && (
          <section style={{ marginTop: "24px", textAlign: "center" }}>
            <h2>Игра окончена</h2>
            <p>Итоговый счёт: {totalScore}</p>
            <button onClick={startGame} style={primaryButton}>
              Сыграть ещё раз
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
