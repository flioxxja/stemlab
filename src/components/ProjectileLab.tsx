"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const W = 900;
const H = 420;
const GROUND = H - 46;
const ORIGIN_X = 56;

const PLANETS: { name: string; g: number }[] = [
  { name: "Luna", g: 1.6 },
  { name: "Marte", g: 3.7 },
  { name: "Tierra", g: 9.8 },
  { name: "Júpiter", g: 24.8 },
];

type Flight = {
  t: number;
  x: number;
  y: number;
  speed: number;
  done: boolean;
  range: number;
  maxH: number;
  time: number;
};

export default function ProjectileLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const [v0, setV0] = useState(32);
  const [angle, setAngle] = useState(45);
  const [g, setG] = useState(9.8);
  const [flight, setFlight] = useState<Flight | null>(null);
  const paramsRef = useRef({ v0, angle, g });
  paramsRef.current = { v0, angle, g };

  const theory = useMemo(() => {
    const th = (angle * Math.PI) / 180;
    const range = (v0 * v0 * Math.sin(2 * th)) / g;
    const maxH = (v0 * v0 * Math.sin(th) ** 2) / (2 * g);
    const time = (2 * v0 * Math.sin(th)) / g;
    return { range, maxH, time };
  }, [v0, angle, g]);

  const scale = useMemo(() => {
    const sx = (W - ORIGIN_X - 40) / Math.max(theory.range, 1);
    const sy = (GROUND - 30) / Math.max(theory.maxH, 1);
    return Math.min(sx, sy);
  }, [theory]);

  const draw = (f: Flight | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { v0: V, angle: A, g: G } = paramsRef.current;
    const th = (A * Math.PI) / 180;
    const sc = scale;

    ctx.clearRect(0, 0, W, H);

    // rejilla
    ctx.strokeStyle = "rgba(148,184,255,0.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 45) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 45) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // suelo
    ctx.strokeStyle = "rgba(148,184,255,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();

    // marcas cada 10 m
    ctx.fillStyle = "rgba(148,163,184,0.85)";
    ctx.font = "11px ui-monospace, monospace";
    ctx.textAlign = "center";
    const step = sc * 10 < 26 ? 20 : 10;
    for (let d = 0; d * sc + ORIGIN_X < W - 10; d += step) {
      const px = ORIGIN_X + d * sc;
      ctx.fillRect(px, GROUND, 1, 7);
      ctx.fillText(`${d} m`, px, GROUND + 22);
    }

    const toPx = (x: number, y: number): [number, number] => [
      ORIGIN_X + x * sc,
      GROUND - y * sc,
    ];

    // trayectoria prevista (punteada)
    const tTotal = (2 * V * Math.sin(th)) / G;
    ctx.strokeStyle = "rgba(148,163,184,0.45)";
    ctx.setLineDash([5, 6]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let t = 0; t <= tTotal; t += tTotal / 60) {
      const x = V * Math.cos(th) * t;
      const y = V * Math.sin(th) * t - 0.5 * G * t * t;
      const [px, py] = toPx(x, Math.max(y, 0));
      if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // cañón
    const [ox, oy] = toPx(0, 0);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(-th);
    ctx.fillStyle = "#334155";
    ctx.fillRect(0, -6, 34, 12);
    ctx.restore();
    ctx.fillStyle = "#1e293b";
    ctx.beginPath(); ctx.arc(ox, oy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath(); ctx.arc(ox, oy, 4, 0, Math.PI * 2); ctx.fill();

    if (f) {
      // trayectoria recorrida
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      const steps = 80;
      for (let i = 0; i <= steps; i++) {
        const t = (f.t * i) / steps;
        const x = V * Math.cos(th) * t;
        const y = Math.max(V * Math.sin(th) * t - 0.5 * G * t * t, 0);
        const [px, py] = toPx(x, y);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      const [px, py] = toPx(f.x, f.y);
      // glow + proyectil
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 22);
      grad.addColorStop(0, "rgba(34,211,238,0.55)");
      grad.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(px, py, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e0faff";
      ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();

      if (f.done) {
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - 8, GROUND - 8); ctx.lineTo(px + 8, GROUND + 8);
        ctx.moveTo(px + 8, GROUND - 8); ctx.lineTo(px - 8, GROUND + 8);
        ctx.stroke();
      }
    }
  };

  useEffect(() => {
    draw(flight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v0, angle, g, flight, scale]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const launch = () => {
    cancelAnimationFrame(rafRef.current);
    const { v0: V, angle: A, g: G } = paramsRef.current;
    const th = (A * Math.PI) / 180;
    const tTotal = (2 * V * Math.sin(th)) / G;
    const range = V * Math.cos(th) * tTotal;
    const maxH = (V * V * Math.sin(th) ** 2) / (2 * G);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1000, tTotal);
      const x = V * Math.cos(th) * t;
      const y = Math.max(V * Math.sin(th) * t - 0.5 * G * t * t, 0);
      const vx = V * Math.cos(th);
      const vy = V * Math.sin(th) - G * t;
      const speed = Math.hypot(vx, vy);
      const done = t >= tTotal;
      setFlight({ t, x, y, speed, done, range, maxH, time: tTotal });
      if (!done) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    setFlight(null);
  };

  const shown = flight ?? {
    t: 0, x: 0, y: 0, speed: v0, done: false,
    range: theory.range, maxH: theory.maxH, time: theory.time,
  };

  return (
    <div className="lab-body">
      <div className="lab-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          aria-label="Simulación de tiro parabólico"
        />
        <div className="stats-row" style={{ marginTop: 18 }}>
          <div className="stat">
            <div className="num">{shown.t.toFixed(2)} s</div>
            <div className="lbl">Tiempo</div>
          </div>
          <div className="stat">
            <div className="num">{shown.y.toFixed(1)} m</div>
            <div className="lbl">Altura actual</div>
          </div>
          <div className="stat">
            <div className="num">{shown.speed.toFixed(1)} m/s</div>
            <div className="lbl">Velocidad</div>
          </div>
          <div className="stat">
            <div className="num">{shown.range.toFixed(1)} m</div>
            <div className="lbl">Alcance</div>
          </div>
          <div className="stat">
            <div className="num">{shown.maxH.toFixed(1)} m</div>
            <div className="lbl">Altura máx.</div>
          </div>
          <div className="stat">
            <div className="num">{shown.time.toFixed(2)} s</div>
            <div className="lbl">Tiempo de vuelo</div>
          </div>
        </div>
      </div>

      <aside className="lab-side">
        <div className="controls">
          <div className="control-row">
            <div className="row-top">
              <label htmlFor="p-v0">Velocidad inicial</label>
              <span className="val">{v0} m/s</span>
            </div>
            <input id="p-v0" type="range" min={5} max={60} step={1} value={v0}
              onChange={(e) => { setV0(Number(e.target.value)); reset(); }} />
          </div>
          <div className="control-row">
            <div className="row-top">
              <label htmlFor="p-angle">Ángulo</label>
              <span className="val">{angle}°</span>
            </div>
            <input id="p-angle" type="range" min={5} max={85} step={1} value={angle}
              onChange={(e) => { setAngle(Number(e.target.value)); reset(); }} />
          </div>
          <div className="control-row">
            <div className="row-top">
              <label htmlFor="p-g">Gravedad</label>
              <span className="val">{g.toFixed(1)} m/s²</span>
            </div>
            <input id="p-g" type="range" min={1} max={25} step={0.1} value={g}
              onChange={(e) => { setG(Number(e.target.value)); reset(); }} />
            <div className="preset-row" style={{ marginTop: 8 }}>
              {PLANETS.map((p) => (
                <button key={p.name} type="button"
                  className={`chip${Math.abs(g - p.g) < 0.05 ? " active" : ""}`}
                  onClick={() => { setG(p.g); reset(); }}>
                  {p.name} {p.g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lab-actions">
          <button type="button" className="btn btn-primary" onClick={launch}>
            Lanzar
          </button>
          <button type="button" className="btn btn-ghost" onClick={reset}>
            Reiniciar
          </button>
        </div>

        <div className="formula">
          {"Alcance = v₀²·sin(2θ)/g = "}
          <b>{theory.range.toFixed(1)} m</b>
          {"\nAltura máx = v₀²·sin²(θ)/(2g) = "}
          <b>{theory.maxH.toFixed(1)} m</b>
          {"\nTiempo = 2·v₀·sin(θ)/g = "}
          <b>{theory.time.toFixed(2)} s</b>
        </div>
      </aside>
    </div>
  );
}
