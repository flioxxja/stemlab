"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const W = 900;
const H = 420;
const PIVOT_X = W / 2;
const PIVOT_Y = 46;
const PX_PER_M = 110;

const PLANETS: { name: string; g: number }[] = [
  { name: "Luna", g: 1.6 },
  { name: "Marte", g: 3.7 },
  { name: "Tierra", g: 9.8 },
  { name: "Júpiter", g: 24.8 },
];

type SimState = {
  theta: number;
  omega: number;
  running: boolean;
  measuredPeriod: number | null;
  crossings: number;
  lastCrossTime: number | null;
  simTime: number;
  prevTheta: number;
};

export default function PendulumLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const [length, setLength] = useState(1.5);
  const [mass, setMass] = useState(1);
  const [g, setG] = useState(9.8);
  const [startAngle, setStartAngle] = useState(30);
  const [showVectors, setShowVectors] = useState(false);
  const [running, setRunning] = useState(false);
  const [measured, setMeasured] = useState<number | null>(null);

  const simRef = useRef<SimState>({
    theta: (30 * Math.PI) / 180,
    omega: 0,
    running: false,
    measuredPeriod: null,
    crossings: 0,
    lastCrossTime: null,
    simTime: 0,
    prevTheta: (30 * Math.PI) / 180,
  });
  const paramsRef = useRef({ length, mass, g, showVectors });
  paramsRef.current = { length, mass, g, showVectors };

  const theory = useMemo(() => {
    const T = 2 * Math.PI * Math.sqrt(length / g);
    const freq = 1 / T;
    const hMax = length * (1 - Math.cos((startAngle * Math.PI) / 180));
    const energy = mass * g * hMax;
    return { T, freq, energy };
  }, [length, g, mass, startAngle]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { length: L, mass: M, showVectors: SV } = paramsRef.current;
    const s = simRef.current;
    const lenPx = L * PX_PER_M;
    const bobX = PIVOT_X + lenPx * Math.sin(s.theta);
    const bobY = PIVOT_Y + lenPx * Math.cos(s.theta);
    const r = 12 + M * 5;

    ctx.clearRect(0, 0, W, H);

    // rejilla
    ctx.strokeStyle = "rgba(148,184,255,0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 45) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 45) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // arco de trayectoria
    ctx.strokeStyle = "rgba(167,139,250,0.35)";
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(PIVOT_X, PIVOT_Y, lenPx, Math.PI / 2 - 1.1, Math.PI / 2 + 1.1);
    ctx.stroke();
    ctx.setLineDash([]);

    // vertical de referencia
    ctx.strokeStyle = "rgba(148,163,184,0.25)";
    ctx.beginPath();
    ctx.moveTo(PIVOT_X, PIVOT_Y);
    ctx.lineTo(PIVOT_X, PIVOT_Y + lenPx + 26);
    ctx.stroke();

    // soporte
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(PIVOT_X - 90, PIVOT_Y - 14, 180, 10);
    ctx.fillStyle = "#334155";
    for (let i = -3; i <= 3; i++) {
      ctx.fillRect(PIVOT_X + i * 24 - 6, PIVOT_Y - 24, 10, 10);
    }

    // cuerda
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PIVOT_X, PIVOT_Y);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // pivote
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath(); ctx.arc(PIVOT_X, PIVOT_Y, 5, 0, Math.PI * 2); ctx.fill();

    if (SV) {
      // velocidad (tangencial, verde) y aceleración tangencial (ámbar)
      const vMag = Math.min(Math.abs(s.omega) * lenPx * 0.55, 90);
      const dirV = Math.sign(s.omega) || 1;
      const tx = Math.cos(s.theta) * dirV;
      const ty = -Math.sin(s.theta) * dirV;
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bobX, bobY);
      ctx.lineTo(bobX + tx * vMag, bobY + ty * vMag);
      ctx.stroke();
      const aMag = Math.min(Math.abs(Math.sin(s.theta)) * 70, 70);
      const dirA = -Math.sign(s.theta) || 1;
      const ax = Math.cos(s.theta) * dirA;
      const ay = -Math.sin(s.theta) * dirA;
      ctx.strokeStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(bobX, bobY);
      ctx.lineTo(bobX + ax * aMag, bobY + ay * aMag);
      ctx.stroke();
      ctx.font = "12px ui-monospace, monospace";
      ctx.fillStyle = "#34d399";
      ctx.fillText("v", bobX + tx * (vMag + 14), bobY + ty * (vMag + 14));
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("a", bobX + ax * (aMag + 14), bobY + ay * (aMag + 14));
    }

    // masa
    const grad = ctx.createRadialGradient(bobX - r / 3, bobY - r / 3, 2, bobX, bobY, r);
    grad.addColorStop(0, "#e0faff");
    grad.addColorStop(0.45, "#22d3ee");
    grad.addColorStop(1, "#0e7490");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(bobX, bobY, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(224,250,255,0.7)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ángulo
    ctx.fillStyle = "rgba(148,163,184,0.9)";
    ctx.font = "12px ui-monospace, monospace";
    ctx.fillText(
      `θ = ${((s.theta * 180) / Math.PI).toFixed(1)}°`,
      PIVOT_X + 14,
      PIVOT_Y + 46
    );
  };

  const step = () => {
    const s = simRef.current;
    const { length: L, g: G } = paramsRef.current;
    const dt = 1 / 240;
    for (let i = 0; i < 4; i++) {
      const alpha = -(G / L) * Math.sin(s.theta);
      s.omega += alpha * dt;
      s.prevTheta = s.theta;
      s.theta += s.omega * dt;
      s.simTime += dt;
      // cruce por el punto más bajo en la misma dirección (omega > 0)
      if (s.prevTheta < 0 && s.theta >= 0 && s.omega > 0) {
        if (s.lastCrossTime !== null) {
          s.measuredPeriod = s.simTime - s.lastCrossTime;
          setMeasured(s.measuredPeriod);
        }
        s.lastCrossTime = s.simTime;
        s.crossings += 1;
      }
    }
    draw();
    if (s.running) rafRef.current = requestAnimationFrame(step);
  };

  const resetSim = (angleDeg: number) => {
    cancelAnimationFrame(rafRef.current);
    simRef.current = {
      theta: (angleDeg * Math.PI) / 180,
      omega: 0,
      running: false,
      measuredPeriod: null,
      crossings: 0,
      lastCrossTime: null,
      simTime: 0,
      prevTheta: (angleDeg * Math.PI) / 180,
    };
    setRunning(false);
    setMeasured(null);
    draw();
  };

  useEffect(() => {
    resetSim(startAngle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAngle]);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, mass, g, showVectors]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const toggleRun = () => {
    const s = simRef.current;
    if (s.running) {
      s.running = false;
      cancelAnimationFrame(rafRef.current);
      setRunning(false);
    } else {
      s.running = true;
      setRunning(true);
      rafRef.current = requestAnimationFrame(step);
    }
  };

  const release = () => {
    resetSim(startAngle);
    simRef.current.running = true;
    setRunning(true);
    rafRef.current = requestAnimationFrame(step);
  };

  return (
    <div className="lab-body">
      <div className="lab-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          aria-label="Simulación de péndulo simple"
        />
        <div className="stats-row" style={{ marginTop: 18 }}>
          <div className="stat">
            <div className="num">{theory.T.toFixed(2)} s</div>
            <div className="lbl">Periodo teórico</div>
          </div>
          <div className="stat">
            <div className="num">{measured !== null ? `${measured.toFixed(2)} s` : "—"}</div>
            <div className="lbl">Periodo medido</div>
          </div>
          <div className="stat">
            <div className="num">{theory.freq.toFixed(2)} Hz</div>
            <div className="lbl">Frecuencia</div>
          </div>
          <div className="stat">
            <div className="num">{theory.energy.toFixed(2)} J</div>
            <div className="lbl">Energía máx.</div>
          </div>
        </div>
      </div>

      <aside className="lab-side">
        <div className="controls">
          <div className="control-row">
            <div className="row-top">
              <label htmlFor="pd-l">Longitud</label>
              <span className="val">{length.toFixed(1)} m</span>
            </div>
            <input id="pd-l" type="range" min={0.3} max={3} step={0.1} value={length}
              onChange={(e) => setLength(Number(e.target.value))} />
          </div>
          <div className="control-row">
            <div className="row-top">
              <label htmlFor="pd-m">Masa</label>
              <span className="val">{mass.toFixed(1)} kg</span>
            </div>
            <input id="pd-m" type="range" min={0.2} max={5} step={0.1} value={mass}
              onChange={(e) => setMass(Number(e.target.value))} />
          </div>
          <div className="control-row">
            <div className="row-top">
              <label htmlFor="pd-a">Ángulo inicial</label>
              <span className="val">{startAngle}°</span>
            </div>
            <input id="pd-a" type="range" min={5} max={60} step={1} value={startAngle}
              onChange={(e) => setStartAngle(Number(e.target.value))} />
          </div>
          <div className="control-row">
            <div className="row-top">
              <label htmlFor="pd-g">Gravedad</label>
              <span className="val">{g.toFixed(1)} m/s²</span>
            </div>
            <input id="pd-g" type="range" min={1} max={25} step={0.1} value={g}
              onChange={(e) => setG(Number(e.target.value))} />
            <div className="preset-row" style={{ marginTop: 8 }}>
              {PLANETS.map((p) => (
                <button key={p.name} type="button"
                  className={`chip${Math.abs(g - p.g) < 0.05 ? " active" : ""}`}
                  onClick={() => setG(p.g)}>
                  {p.name} {p.g}
                </button>
              ))}
            </div>
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.9rem", color: "var(--muted)" }}>
            <input type="checkbox" checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)} />
            Mostrar vectores v y a
          </label>
        </div>

        <div className="lab-actions">
          <button type="button" className="btn btn-primary" onClick={release}>
            Soltar
          </button>
          <button type="button" className="btn btn-ghost" onClick={toggleRun}>
            {running ? "Pausar" : "Reanudar"}
          </button>
        </div>

        <div className="formula">
          {"T = 2π·√(L/g) = 2π·√("}
          {length.toFixed(1)}/{g.toFixed(1)}
          {") = "}
          <b>{theory.T.toFixed(2)} s</b>
          {"\nLa masa no cambia el periodo: prueba subirla y mide."}
        </div>
      </aside>
    </div>
  );
}
