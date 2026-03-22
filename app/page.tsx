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

  async function startGame() {
    setError("");

    const res = await fetch("/api/start-game");
    const data = await res.json();

    setRounds(data.rounds || []);
    setCurrentIndex(0);
    setResult(null);
    setSelectedPoint(null);
  }

  async function submitAnswer() {
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
  }

  function nextRound() {
    setError("");
    setResult(null);
    setSelectedPoint(null);
    setCurrentIndex((prev) => prev + 1);
  }

  const current = rounds[currentIndex];
  const gameFinished = rounds.length > 0 && currentIndex >= rounds.length;

  return (
    <main
      style={{
        padding: "24px",
        fontFamily: "sans-serif",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <h1>Geo Quiz</h1>

      <button onClick={startGame} style={{ marginBottom: "20px" }}>
        Start Game
      </button>

      {error && <p style={{ color: "crimson", marginTop: "12px" }}>{error}</p>}

      {current && !gameFinished && (
        <section style={{ marginTop: "20px" }}>
          <h2>Round {currentIndex + 1}</h2>
          <p>ID: {current.id}</p>
          <p>Image: {current.image}</p>

          <MapPicker
            selectedPoint={selectedPoint}
            correctPoint={result?.correct || null}
            distanceKm={result?.distanceKm || null}
            onSelect={setSelectedPoint}
          />

          {selectedPoint && (
            <p style={{ marginTop: "12px" }}>
              Selected point: {selectedPoint.lat.toFixed(6)},{" "}
              {selectedPoint.lng.toFixed(6)}
            </p>
          )}

          <button onClick={submitAnswer} style={{ marginTop: "16px" }}>
            Submit Answer
          </button>
        </section>
      )}

      {result && (
        <section
          style={{
            marginTop: "24px",
            padding: "16px",
            border: "1px solid #ccc",
            borderRadius: "12px",
          }}
        >
          <h3>Result</h3>
          <p>Distance: {result.distanceKm} km</p>
          <p>Score: {result.score}</p>
          <p>
            Your point: {result.user.lat}, {result.user.lng}
          </p>
          <p>
            Correct point: {result.correct.lat}, {result.correct.lng}
          </p>

          <button onClick={nextRound} style={{ marginTop: "12px" }}>
            Next
          </button>
        </section>
      )}

      {gameFinished && (
        <section style={{ marginTop: "24px" }}>
          <h2>Game finished</h2>
          <button onClick={startGame}>Play Again</button>
        </section>
      )}
    </main>
  );
}
