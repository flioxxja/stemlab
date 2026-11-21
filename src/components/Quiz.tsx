"use client";

import { useEffect, useRef, useState } from "react";

type Question = {
  topic: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const QUESTIONS: Question[] = [
  {
    topic: "Tiro parabólico",
    question:
      "Un proyectil sale a 20 m/s con un ángulo de 30° en la Tierra (g = 9.8 m/s²). ¿Cuál es su alcance aproximado?",
    options: ["20.4 m", "35.3 m", "40.8 m", "70.7 m"],
    answer: 1,
    explanation:
      "Alcance = v₀²·sin(2θ)/g = 400·sin(60°)/9.8 = 400·0.866/9.8 ≈ 35.3 m.",
  },
  {
    topic: "Tiro parabólico",
    question:
      "Con la misma velocidad inicial, ¿qué ángulo da el alcance máximo en terreno plano?",
    options: ["30°", "45°", "60°", "90°"],
    answer: 1,
    explanation:
      "El alcance depende de sin(2θ), que es máximo cuando 2θ = 90°, es decir θ = 45°.",
  },
  {
    topic: "Tiro parabólico",
    question:
      "Lanzas una pelota hacia arriba a 19.6 m/s (g = 9.8 m/s²). ¿Cuánto tarda en volver a tu mano?",
    options: ["2 s", "3 s", "4 s", "8 s"],
    answer: 2,
    explanation:
      "Sube en v₀/g = 19.6/9.8 = 2 s y baja en otros 2 s: total 4 s.",
  },
  {
    topic: "Tiro parabólico",
    question:
      "Si lanzas el mismo proyectil en la Luna (g = 1.6 m/s²), su alcance será…",
    options: ["Menor", "Igual", "Mayor", "No volará"],
    answer: 2,
    explanation:
      "El alcance es inversamente proporcional a g: con menos gravedad, el proyectil tarda más en caer y llega más lejos.",
  },
  {
    topic: "Péndulo",
    question:
      "Un péndulo de 1 m de longitud oscila en la Tierra (g = 9.8 m/s²). ¿Cuál es su periodo aproximado?",
    options: ["1.0 s", "2.0 s", "3.1 s", "6.3 s"],
    answer: 1,
    explanation:
      "T = 2π·√(L/g) = 2π·√(1/9.8) ≈ 2π·0.32 ≈ 2.0 s.",
  },
  {
    topic: "Péndulo",
    question: "Si duplicas la masa del péndulo, su periodo…",
    options: ["Se duplica", "Se reduce a la mitad", "No cambia", "Se cuadruplica"],
    answer: 2,
    explanation:
      "El periodo T = 2π·√(L/g) no depende de la masa. Solo importan la longitud y la gravedad.",
  },
  {
    topic: "Péndulo",
    question: "Si cuadruplicas la longitud de un péndulo, su periodo…",
    options: ["Queda igual", "Se duplica", "Se cuadruplica", "Se reduce a la mitad"],
    answer: 1,
    explanation:
      "T crece con √L: √4 = 2, así que el periodo se duplica.",
  },
  {
    topic: "Péndulo",
    question:
      "El mismo péndulo en Júpiter (g = 24.8 m/s²) tendrá un periodo…",
    options: ["Mayor", "Menor", "Igual", "Infinito"],
    answer: 1,
    explanation:
      "Con más gravedad el péndulo oscila más rápido: T = 2π·√(L/g) disminuye al crecer g.",
  },
  {
    topic: "Ley de Ohm",
    question:
      "Una batería de 12 V se conecta a una resistencia de 4 Ω. ¿Qué corriente circula?",
    options: ["0.33 A", "3 A", "4 A", "48 A"],
    answer: 1,
    explanation: "I = V/R = 12/4 = 3 A.",
  },
  {
    topic: "Ley de Ohm",
    question:
      "Un bombillo trabaja a 9 V y consume 2 A. ¿Cuál es su potencia?",
    options: ["4.5 W", "11 W", "18 W", "81 W"],
    answer: 2,
    explanation: "P = V·I = 9·2 = 18 W.",
  },
  {
    topic: "Ley de Ohm",
    question:
      "Dos resistencias de 5 Ω y 15 Ω en serie equivalen a…",
    options: ["3.75 Ω", "10 Ω", "20 Ω", "75 Ω"],
    answer: 2,
    explanation: "En serie las resistencias se suman: 5 + 15 = 20 Ω.",
  },
  {
    topic: "Ley de Ohm",
    question:
      "Dos resistencias de 10 Ω en paralelo equivalen a…",
    options: ["5 Ω", "10 Ω", "20 Ω", "100 Ω"],
    answer: 0,
    explanation:
      "En paralelo: 1/R = 1/10 + 1/10 = 0.2, así que R = 5 Ω.",
  },
];

const TIME_LIMIT = 20;
const BEST_KEY = "stemlab-best";

type Phase = "intro" | "playing" | "done";

export default function Quiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [best, setBest] = useState<number>(0);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    const raw = window.localStorage.getItem(BEST_KEY);
    if (raw) setBest(Number(raw) || 0);
  }, []);

  useEffect(() => {
    if (phase !== "playing" || picked !== null) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          setPicked(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, index, picked]);

  const start = () => {
    setPhase("playing");
    setIndex(0);
    setScore(0);
    setCorrectCount(0);
    setPicked(null);
    setTimeLeft(TIME_LIMIT);
    startedAtRef.current = Date.now();
  };

  const pick = (option: number) => {
    if (picked !== null) return;
    setPicked(option);
    const q = QUESTIONS[index];
    if (option === q.answer) {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const bonus = elapsed < 10 ? 20 : 0;
      setScore((s) => s + 100 + bonus);
      setCorrectCount((c) => c + 1);
    }
  };

  const next = () => {
    if (index + 1 >= QUESTIONS.length) {
      setPhase("done");
      setBest((b) => {
        const nb = Math.max(b, score);
        window.localStorage.setItem(BEST_KEY, String(nb));
        return nb;
      });
    } else {
      setIndex(index + 1);
      setPicked(null);
      setTimeLeft(TIME_LIMIT);
      startedAtRef.current = Date.now();
    }
  };

  if (phase === "intro") {
    return (
      <div className="quiz-final">
        <p className="kicker">12 preguntas · 20 s por pregunta</p>
        <h3 style={{ fontSize: "1.6rem", marginBottom: 10 }}>
          ¿Cuánto sabes de física?
        </h3>
        <p style={{ color: "var(--muted)", maxWidth: 520, margin: "0 auto 24px" }}>
          Tiro parabólico, péndulo y Ley de Ohm. Acierto = 100 puntos, y si
          respondes en menos de 10 segundos, +20 extra.
        </p>
        {best > 0 && (
          <p style={{ marginBottom: 18 }}>
            Tu mejor puntaje: <b style={{ color: "var(--cyan)" }}>{best}</b>
          </p>
        )}
        <button type="button" className="btn btn-primary" onClick={start}>
          Empezar retos
        </button>
      </div>
    );
  }

  if (phase === "done") {
    const pct = correctCount / QUESTIONS.length;
    const message =
      pct >= 0.8
        ? "¡Nivel laboratorio pro!"
        : pct >= 0.5
          ? "Buen experimento, sigue practicando"
          : "Vuelve a los laboratorios y reintenta";
    return (
      <div className="quiz-final">
        <p className="kicker">Resultado</p>
        <div className="score grad">{score}</div>
        <p style={{ fontSize: "1.15rem", margin: "10px 0 6px" }}>
          {correctCount} de {QUESTIONS.length} correctas
        </p>
        <p style={{ color: "var(--muted)", marginBottom: 8 }}>{message}</p>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          Mejor puntaje guardado: <b style={{ color: "var(--cyan)" }}>{best}</b>
        </p>
        <button type="button" className="btn btn-primary" onClick={start}>
          Jugar de nuevo
        </button>
      </div>
    );
  }

  const q = QUESTIONS[index];
  const answered = picked !== null;

  return (
    <div>
      <div className="progress-bar" aria-hidden="true">
        <div style={{ width: `${(index / QUESTIONS.length) * 100}%` }} />
      </div>
      <div className="quiz-meta">
        <span>
          Pregunta {index + 1} de {QUESTIONS.length}
        </span>
        <span className="chip" style={{ cursor: "default" }}>{q.topic}</span>
        <span className="timer" aria-live="polite">
          {answered ? "" : `${timeLeft} s`}
        </span>
        <span>
          Puntos: <b style={{ color: "var(--cyan)" }}>{score}</b>
        </span>
      </div>
      <p className="quiz-q">{q.question}</p>
      <div className="quiz-options">
        {q.options.map((opt, i) => {
          let cls = "quiz-option";
          if (answered && i === q.answer) cls += " correct";
          else if (answered && i === picked) cls += " wrong";
          return (
            <button
              key={opt}
              type="button"
              className={cls}
              disabled={answered}
              onClick={() => pick(i)}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <>
          <div className="quiz-explain">
            {picked === q.answer
              ? "¡Correcto! "
              : picked === -1
                ? "Se acabó el tiempo. "
                : "No exactamente. "}
            {q.explanation}
          </div>
          <div style={{ marginTop: 20, textAlign: "right" }}>
            <button type="button" className="btn btn-primary" onClick={next}>
              {index + 1 >= QUESTIONS.length ? "Ver resultado" : "Siguiente"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
