import ProjectileLab from "@/components/ProjectileLab";
import PendulumLab from "@/components/PendulumLab";
import OhmLab from "@/components/OhmLab";
import Quiz from "@/components/Quiz";

export default function Home() {
  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <a className="logo" href="#">
            STEMLab<span className="dot">.</span>
          </a>
          <nav className="nav-links" aria-label="Principal">
            <a href="#labs">Laboratorios</a>
            <a href="#retos">Retos</a>
            <a href="#como">Cómo funciona</a>
            <a className="btn btn-primary" href="#labs">
              Empezar
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero bg-grid bg-glow">
          <div className="container reveal">
            <p className="kicker">Laboratorio STEM interactivo</p>
            <h1>
              Aprende física
              <br />
              <span className="grad">tocando las variables.</span>
            </h1>
            <p className="hero-sub">
              Simulaciones en vivo, retos con puntaje y explicaciones paso a
              paso. Sin cuentas, sin instalar nada: abre y experimenta.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#labs">
                Entrar al laboratorio
              </a>
              <a className="btn btn-ghost" href="#retos">
                Ver retos
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="num">3</div>
                <div className="lbl">Simulaciones en vivo</div>
              </div>
              <div className="stat">
                <div className="num">12</div>
                <div className="lbl">Retos con explicación</div>
              </div>
              <div className="stat">
                <div className="num">100%</div>
                <div className="lbl">Gratis, sin cuentas</div>
              </div>
            </div>
          </div>
        </section>

        {/* LABORATORIOS */}
        <section className="section" id="labs">
          <div className="container">
            <div className="section-head">
              <p className="kicker">Laboratorios</p>
              <h2>Experimenta, no memorices</h2>
              <p>
                Cada laboratorio corre física real en tu navegador. Mueve un
                control y mira cómo cambia el fenómeno al instante.
              </p>
            </div>

            <article className="lab-shell">
              <div className="lab-head">
                <span className="badge">Cinemática</span>
                <h3>Tiro parabólico</h3>
                <p>
                  Lanza un proyectil y descubre cómo la velocidad, el ángulo y
                  la gravedad de cada planeta cambian su alcance.
                </p>
              </div>
              <ProjectileLab />
            </article>

            <article className="lab-shell">
              <div className="lab-head">
                <span className="badge">Oscilaciones</span>
                <h3>Péndulo simple</h3>
                <p>
                  Mide el periodo real y compáralo con la teoría. Pista: la
                  masa no importa, pero la longitud sí.
                </p>
              </div>
              <PendulumLab />
            </article>

            <article className="lab-shell">
              <div className="lab-head">
                <span className="badge">Electricidad</span>
                <h3>Ley de Ohm</h3>
                <p>
                  Arma circuitos en serie y paralelo, mira circular los
                  electrones y enciende el bombillo sin quemarlo.
                </p>
              </div>
              <OhmLab />
            </article>
          </div>
        </section>

        {/* RETOS */}
        <section className="section" id="retos" style={{ paddingTop: 24 }}>
          <div className="container">
            <div className="section-head">
              <p className="kicker">Retos</p>
              <h2>Pon a prueba lo que aprendiste</h2>
              <p>
                12 preguntas con números reales. Responde rápido para ganar
                puntos extra y lee la explicación de cada respuesta.
              </p>
            </div>
            <div className="card">
              <Quiz />
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="section" id="como" style={{ paddingTop: 24 }}>
          <div className="container">
            <div className="section-head">
              <p className="kicker">Cómo funciona</p>
              <h2>Aprender haciendo, en 3 pasos</h2>
            </div>
            <div className="grid-3">
              <div className="card">
                <div className="step-num">1</div>
                <h3>Mueve las variables</h3>
                <p style={{ color: "var(--muted)", marginTop: 8 }}>
                  Sliders en vivo para velocidad, ángulo, gravedad, longitud,
                  voltaje y resistencia. Tú decides el experimento.
                </p>
              </div>
              <div className="card">
                <div className="step-num">2</div>
                <h3>Observa el fenómeno</h3>
                <p style={{ color: "var(--muted)", marginTop: 8 }}>
                  Canvas en tiempo real con datos medidos y las fórmulas con
                  tus valores sustituidos, para conectar teoría y práctica.
                </p>
              </div>
              <div className="card">
                <div className="step-num">3</div>
                <h3>Responde y gana puntos</h3>
                <p style={{ color: "var(--muted)", marginTop: 8 }}>
                  Retos cronometrados con explicación inmediata. Tu mejor
                  puntaje queda guardado en tu dispositivo.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>STEMLab — Hecho para STEM2Connect AI · Aprende STEM experimentando</span>
          <span>Sin cuentas. Sin costos. Solo curiosidad.</span>
        </div>
      </footer>
    </>
  );
}
