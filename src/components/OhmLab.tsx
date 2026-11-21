"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const W = 900;
const H = 360;

// Rectángulo del circuito
const X0 = 120;
const X1 = W - 120;
const Y0 = 70;
const Y1 = H - 70;
const PERIMETER = 2 * (X1 - X0) + 2 * (Y1 - Y0);

function pointOnLoop(d: number): [number, number] {
  const w = X1 - X0;
  const h = Y1 - Y0;
  let p = ((d % PERIMETER) + PERIMETER) % PERIMETER;
  if (p < w) return [X0 + p, Y0];
  p -= w;
  if (p < h) return [X1, Y0 + p];
  p -= h;
  if (p < w) return [X1 - p, Y1];
  p -= w;
  return [X0, Y1 - p];
}

type Mode = "serie" | "paralelo";

export default function OhmLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const [voltage, setVoltage] = useState(9);
  const [r1, setR1] = useState(10);
  const [r2, setR2] = useState(20);
  const [mode, setMode] = useState<Mode>("serie");
  const [useTwo, setUseTwo] = useState(false);

  const calc = useMemo(() => {
    let rTotal: number;
    if (!useTwo) rTotal = r1;
    else if (mode === "serie") rTotal = r1 + r2;
    else rTotal = (r1 * r2) / (r1 + r2);
    const current = voltage / rTotal;
    const power = voltage * current;
    return { rTotal, current, power };
  }, [voltage, r1, r2, mode, useTwo]);

  const paramsRef = useRef({ voltage, r1, r2, mode, useTwo, ...calc });
  paramsRef.current = { voltage, r1, r2, mode, useTwo, ...calc };

  const draw = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { voltage: V, r1: R1, r2: R2, mode: M, useTwo: TWO, current: I, power: P } =
      paramsRef.current;

    ctx.clearRect(0, 0, W, H);

    // cable principal
    ctx.strokeStyle = "rgba(203,213,225,0.75)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(X0, Y0);
    ctx.lineTo(X1, Y0);
    ctx.lineTo(X1, Y1);
    ctx.lineTo(X0, Y1);
    ctx.closePath();
    ctx.stroke();

    // batería (lado izquierdo)
    const midY = (Y0 + Y1) / 2;
    ctx.fillStyle = "#0a1120";
    ctx.fillRect(X0 - 16, midY - 30, 32, 60);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(X0 - 16, midY - 10); ctx.lineTo(X0 + 16, midY - 10); ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(X0 - 9, midY + 6); ctx.lineTo(X0 + 9, midY + 6); ctx.stroke();
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 15px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("+", X0 - 30, midY - 6);
    ctx.fillText("−", X0 - 30, midY + 14);
    ctx.fillStyle = "#e8ecf4";
    ctx.font = "bold 16px ui-monospace, monospace";
    ctx.fillText(`${V.toFixed(0)} V`, X0, midY + 52);

    // resistencia en zigzag (lado superior)
    const drawResistor = (cx: number, cy: number, label: string) => {
      ctx.fillStyle = "#0a1120";
      ctx.fillRect(cx - 42, cy - 14, 84, 28);
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      const seg = 84 / 6;
      ctx.moveTo(cx - 42, cy);
      for (let i = 0; i < 6; i++) {
        ctx.lineTo(cx - 42 + seg * (i + 0.5), cy + (i % 2 === 0 ? -11 : 11));
      }
      ctx.lineTo(cx + 42, cy);
      ctx.stroke();
      ctx.fillStyle = "#c4b5fd";
      ctx.font = "bold 14px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, cx, cy - 24);
    };

    const topMid = (X0 + X1) / 2;
    if (!TWO) {
      drawResistor(topMid, Y0, `R = ${R1} Ω`);
    } else if (M === "serie") {
      drawResistor(topMid - 110, Y0, `R₁ = ${R1} Ω`);
      drawResistor(topMid + 110, Y0, `R₂ = ${R2} Ω`);
    } else {
      // paralelo: rama superior con R1 y rama interior con R2
      drawResistor(topMid, Y0, `R₁ = ${R1} Ω`);
      const innerY = Y0 + 64;
      ctx.strokeStyle = "rgba(203,213,225,0.55)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(X0 + 60, Y0);
      ctx.lineTo(X0 + 60, innerY);
      ctx.lineTo(X1 - 60, innerY);
      ctx.lineTo(X1 - 60, Y0);
      ctx.stroke();
      drawResistor(topMid, innerY, `R₂ = ${R2} Ω`);
    }

    // bombillo (lado derecho)
    const bulbX = X1;
    const bulbY = midY;
    const glowR = 26 + Math.min(P * 2.2, 74);
    const glow = ctx.createRadialGradient(bulbX, bulbY, 0, bulbX, bulbY, glowR);
    const alpha = Math.min(0.15 + P / 30, 0.75);
    glow.addColorStop(0, `rgba(251,191,36,${alpha})`);
    glow.addColorStop(1, "rgba(251,191,36,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(bulbX, bulbY, glowR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0a1120";
    ctx.beginPath(); ctx.arc(bulbX, bulbY, 24, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = P > 20 ? "#f472b6" : "#fbbf24";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(bulbX, bulbY, 24, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = P > 0.5 ? "#fde68a" : "#64748b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bulbX - 10, bulbY + 10);
    ctx.lineTo(bulbX - 4, bulbY - 6);
    ctx.lineTo(bulbX + 2, bulbY + 4);
    ctx.lineTo(bulbX + 8, bulbY - 8);
    ctx.lineTo(bulbX + 12, bulbY + 10);
    ctx.stroke();
    ctx.fillStyle = "#e8ecf4";
    ctx.font = "bold 14px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${P.toFixed(1)} W`, bulbX, bulbY + 48);

    // electrones circulando (velocidad según corriente)
    const speed = 30 + I * 260;
    const count = 16;
    ctx.fillStyle = "#22d3ee";
    for (let i = 0; i < count; i++) {
      const d = (i / count) * PERIMETER + time * speed;
      const [ex, ey] = pointOnLoop(d);
      ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();
    }

    // etiqueta de corriente
    ctx.fillStyle = "#22d3ee";
    ctx.font = "bold 15px ui-monospace, monospace";
    ctx.fillText(`I = ${I.toFixed(2)} A`, topMid, Y1 + 34);
  };

  useEffect(() => {
    const loop = (now: number) => {
      draw(now / 1000);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brightness = calc.power < 2 ? "Bajo" : calc.power < 10 ? "Medio" : "Alto";

  return (
    <div className="lab-body">
      <div className="lab-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          aria-label="Simulación de circuito eléctrico, Ley de Ohm"
        />
        <div className="stats-row" style={{ marginTop: 18 }}>
          <div className="stat">
            <div className="num">{calc.current.toFixed(2)} A</div>
            <div className="lbl">Corriente</div>
          </div>
          <div className="stat">
            <div className="num">{(calc.current * 1000).toFixed(0)} mA</div>
            <div className="lbl">En miliamperios</div>
          </div>
          <div className="stat">
            <div className="num">{calc.rTotal.toFixed(1)} Ω</div>
            <div className="lbl">R equivalente</div>
          </div>
          <div className="stat">
            <div className="num">{calc.power.toFixed(1)} W</div>
            <div className="lbl">Potencia</div>
          </div>
          <div className="stat">
            <div className="num">{brightness}</div>
            <div className="lbl">Brillo</div>
          </div>
        </div>
      </div>

      <aside className="lab-side">
        <div className="controls">
          <div className="control-row">
            <div className="row-top">
              <label htmlFor="o-v">Voltaje</label>
              <span className="val">{voltage} V</span>
            </div>
            <input id="o-v" type="range" min={1} max={24} step={1} value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))} />
          </div>
          <div className="control-row">
            <div className="row-top">
              <label htmlFor="o-r1">Resistencia R₁</label>
              <span className="val">{r1} Ω</span>
            </div>
            <input id="o-r1" type="range" min={1} max={100} step={1} value={r1}
              onChange={(e) => setR1(Number(e.target.value))} />
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.9rem", color: "var(--muted)" }}>
            <input type="checkbox" checked={useTwo}
              onChange={(e) => setUseTwo(e.target.checked)} />
            Agregar segunda resistencia
          </label>
          {useTwo && (
            <>
              <div className="control-row">
                <div className="row-top">
                  <label htmlFor="o-r2">Resistencia R₂</label>
                  <span className="val">{r2} Ω</span>
                </div>
                <input id="o-r2" type="range" min={1} max={100} step={1} value={r2}
                  onChange={(e) => setR2(Number(e.target.value))} />
              </div>
              <div className="preset-row">
                <button type="button"
                  className={`chip${mode === "serie" ? " active" : ""}`}
                  onClick={() => setMode("serie")}>
                  Serie
                </button>
                <button type="button"
                  className={`chip${mode === "paralelo" ? " active" : ""}`}
                  onClick={() => setMode("paralelo")}>
                  Paralelo
                </button>
              </div>
            </>
          )}
        </div>

        {calc.power > 20 && (
          <span className="chip warn">¡Mucha potencia! El bombillo se quemaría</span>
        )}

        <div className="formula">
          {"V = I·R  →  I = V/R = "}
          {voltage}/{calc.rTotal.toFixed(1)}
          {" = "}
          <b>{calc.current.toFixed(2)} A</b>
          {"\nP = V·I = "}
          <b>{calc.power.toFixed(1)} W</b>
          {useTwo && mode === "serie" && `\nSerie: R = R₁+R₂ = ${r1}+${r2} = ${calc.rTotal.toFixed(1)} Ω`}
          {useTwo && mode === "paralelo" && `\nParalelo: 1/R = 1/R₁+1/R₂ → R = ${calc.rTotal.toFixed(1)} Ω`}
        </div>
      </aside>
    </div>
  );
}
