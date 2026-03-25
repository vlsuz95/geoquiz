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

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.55,
    cursor: "not-allowed",
  };

  return (
    <main
      style={{
        padding: "24px",
        fontFamily: "sans-serif",
        maxWidth: "1000px",
        margin: "0 auto",
        background: "Canvas",
        color: "CanvasText",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: "12px" }}>Geo Quiz</h1>

      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={startGame}
          disabled={isLoading}
          style={isLoading ? disabledButtonStyle : buttonStyle}
        >
          {isLoading ? "Загрузка..." : "Начать игру"}
        </button>

        {rounds.length > 0 && !gameFinished && (
          <>
            <span>
              Раунд: {currentIndex + 1} / {rounds.length}
            </span>
            <span>Сумма очков: {totalScore}</span>
          </>
        )}
      </div>

      {error && (
        <p style={{ color: "crimson", marginBottom: "16px" }}>{error}</p>
      )}

      {current && !gameFinished && (
        <section style={{ marginTop: "20px" }}>
          <h2 style={{ marginBottom: "12px" }}>Раунд {currentIndex + 1}</h2>

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
            onSelect={setSelectedPoint}
          />

          {!result && (
            <button
              onClick={submitAnswer}
              disabled={!canSubmit}
              style={
                canSubmit
                  ? { ...buttonStyle, marginTop: "16px" }
                  : { ...disabledButtonStyle, marginTop: "16px" }
              }
            >
              {isLoading ? "Проверяем..." : "Отправить ответ"}
            </button>
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

          <button
            onClick={nextRound}
            style={{ ...buttonStyle, marginTop: "16px" }}
          >
            Следующий раунд
          </button>
        </section>
      )}

      {gameFinished && (
        <section style={{ marginTop: "24px" }}>
          <h2>Игра окончена</h2>
          <p>Итоговый счёт: {totalScore}</p>
          <button onClick={startGame} style={buttonStyle}>
            Сыграть ещё раз
          </button>
        </section>
      )}
    </main>
  );
}
