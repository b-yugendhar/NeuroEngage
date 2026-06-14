import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Loader2,
  Activity,
  Stethoscope,
  Users,
  Heart,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Clean Light Theme CSS ── */
const pageStyles = `
  :root {
    --primary: #4f46e5;
    --primary-light: #818cf8;
    --secondary: #7c3aed;
    --background: #ffffff;
    --surface: #f8fafc;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --accent: #38bdf8;
  }

  .home-root {
    background: var(--background);
    color: var(--text-main);
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }

  .nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 72px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    z-index: 1000;
  }

  .section {
    padding: 100px 40px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .hero-section {
    padding-top: 180px;
    display: flex;
    align-items: center;
    gap: 60px;
    min-height: 90vh;
  }

  .hero-content { flex: 1; }
  .hero-visual { flex: 1; position: relative; }

  .btn-primary {
    background: var(--primary);
    color: white;
    padding: 14px 28px;
    border-radius: 12px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn-primary:hover {
    background: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
  }

  .card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px;
    transition: all 0.3s;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
    border-color: var(--primary-light);
  }

  .grid-3 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
  }

  .brain-wave-tutor {
    background: var(--surface);
    border-radius: 32px;
    padding: 60px;
    margin-top: 60px;
  }

  .wave-canvas-container {
    height: 200px;
    background: white;
    border-radius: 16px;
    margin: 20px 0;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border);
  }

  .wave-selector {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .wave-btn {
    padding: 8px 16px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: white;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }

  .wave-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .login-container {
    background: var(--surface);
    border-top: 1px solid var(--border);
  }

  .login-input {
    width: 100%;
    height: 52px;
    border-radius: 12px;
    padding: 0 16px;
    border: 1px solid var(--border);
    background: white;
    margin-bottom: 16px;
    outline: none;
    transition: border-color 0.2s;
  }

  .login-input:focus {
    border-color: var(--primary);
  }

  .badge {
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: inline-block;
    margin-bottom: 12px;
  }

  .badge-primary { background: rgba(79, 70, 229, 0.1); color: var(--primary); }

  @media (max-width: 1024px) {
    .hero-section { flex-direction: column; text-align: center; padding-top: 120px; }
    .hero-visual { width: 100%; }
    .nav-bar { padding: 0 20px; }
  }
`;

const BRAIN_WAVES = [
  {
    id: "delta",
    name: "Delta Waves",
    freq: "0.5–4 Hz",
    state: "Deep Sleep",
    color: "#3b82f6",
    desc: "Associated with the deepest levels of relaxation and restorative, healing sleep. They are found most often in infants and young children.",
    speed: 1,
  },
  {
    id: "theta",
    name: "Theta Waves",
    freq: "4–8 Hz",
    state: "Meditation / REM Sleep",
    color: "#8b5cf6",
    desc: "Associated with gateway to learning, memory, and intuition. In theta, our senses are withdrawn from the external world.",
    speed: 2,
  },
  {
    id: "alpha",
    name: "Alpha Waves",
    freq: "8–13 Hz",
    state: "Relaxed Focus",
    color: "#ec4899",
    desc: "Present when you are daydreaming, meditating, or consciously practicing mindfulness. Aids mental coordination and calmness.",
    speed: 4,
  },
  {
    id: "beta",
    name: "Beta Waves",
    freq: "13–32 Hz",
    state: "Active Alertness",
    color: "#f59e0b",
    desc: "Typical for normal waking consciousness and a heightened state of alertness, logic and critical reasoning.",
    speed: 8,
  },
  {
    id: "gamma",
    name: "Gamma Waves",
    freq: "32–100 Hz",
    state: "Heightened Perception",
    color: "#10b981",
    desc: "Occur during bursts of insight and high-level information processing. They relate to the simultaneous processing of info.",
    speed: 15,
  },
];

const BrainWaveVisualizer: React.FC<{ speed: number; color: string }> = ({
  speed,
  color,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const amplitude = 40;
      const frequency = speed * 0.01;
      const step = 4;

      ctx.moveTo(0, canvas.height / 2);
      for (let x = 0; x <= canvas.width; x += step) {
        const y =
          canvas.height / 2 + Math.sin(x * frequency + offset) * amplitude;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      offset -= 0.1;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [speed, color]);

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={200}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeWave, setActiveWave] = useState(BRAIN_WAVES[2]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [managerCode, setManagerCode] = useState("");
  const [role, setRole] = useState<"subject" | "manager">("subject");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return setError("All fields required");
    setLoading(true);
    setError("");

    const endpoint = isRegistering ? "https://neuroengage.onrender.com/api/auth/register" : "https://neuroengage.onrender.com/api/auth/login";
    const payload = isRegistering
      ? {
          username,
          password,
          role,
          managerCode: role === "subject" ? managerCode : undefined,
        }
      : { username, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Authentication failed");

      localStorage.setItem("neuro_user", data.userId);
      localStorage.setItem("neuro_username", data.username);
      localStorage.setItem("neuro_role", data.role);
      localStorage.setItem("neuro_pairing_code", data.pairingCode || "");
      localStorage.setItem("neuro_manager_code", data.managerCode || "");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="home-root">
      <style>{pageStyles}</style>

      <nav className="nav-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BrainCircuit color="white" size={24} />
          </div>
          <span
            style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}
          >
            NeuroEngage
          </span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <a
            href="#services"
            style={{
              textDecoration: "none",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            Services
          </a>
          <a
            href="#brain-tutor"
            style={{
              textDecoration: "none",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            Brain Waves
          </a>
          <a
            href="#experts"
            style={{
              textDecoration: "none",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            Experts
          </a>
          <button
            className="btn-primary"
            onClick={() =>
              document
                .getElementById("auth-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Portal Login
          </button>
        </div>
      </nav>

      <section className="section hero-section">
        <div className="hero-content">
          <span className="badge badge-primary">Next-Gen Neuro-Engage</span>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Unlocking the Secrets of your{" "}
            <span style={{ color: "var(--primary)" }}>Neural Pathways</span>
          </h1>
          <p
            style={{
              fontSize: 20,
              color: "var(--text-muted)",
              lineHeight: 1.6,
              marginBottom: 40,
            }}
          >
            Advanced EEG monitoring and cognitive assessment platform designed
            for patients, doctors, and researchers. Understand your brain waves
            in real-time with clinical precision.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <button
              className="btn-primary"
              onClick={() =>
                document
                  .getElementById("brain-tutor")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              How it works <ArrowRight size={18} />
            </button>
            <button
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                padding: "14px 28px",
                borderRadius: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              View Case Studies
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <motion.div 
            style={{ width: '100%', height: 'auto', borderRadius: 32, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="https://cdn.dribbble.com/userupload/44366577/file/29261ea2f21de39cc959d5cd1c78c04e.gif" 
              alt="Neural Visualization" 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
              onError={(e) => {
                e.currentTarget.src = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3NyeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lTfuxs659E8JLW/giphy.gif";
              }}
            />
          </motion.div>
        </div>
      </section>

      <section className="section" id="services">
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
            Comprehensive Neural Services
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 18,
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            We provide a suite of tools for monitoring, analyzing, and improving
            cognitive health.
          </p>
        </div>
        <div className="grid-3">
          <div className="card">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Activity color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              Real-time EEG
            </h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Live stream brain wave data with millisecond precision directly
              from your wearable device.
            </p>
          </div>
          <div className="card">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Heart color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              Stress Analysis
            </h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Identify anxiety and stress triggers through our advanced
              ML-powered classification engine.
            </p>
          </div>
          <div className="card">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Users color="#22c55e" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              Clinical Collaboration
            </h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Connect patients and doctors in a unified workspace for better
              diagnostic outcomes.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="brain-tutor">
        <div className="brain-wave-tutor">
          <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
            <div style={{ flex: 1.5 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
                The Brain Wave Tutor
              </h2>
              <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
                Understanding your brain waves is the first step to mastering
                your cognitive health. Select a wave frequency below to learn
                about its characteristics and state of mind.
              </p>

              <div className="wave-selector">
                {BRAIN_WAVES.map((wave) => (
                  <button
                    key={wave.id}
                    className={`wave-btn ${activeWave.id === wave.id ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveWave(wave);
                    }}
                    style={{ zIndex: 10, position: "relative" }}
                  >
                    {wave.name}
                  </button>
                ))}
              </div>

              <div className="wave-canvas-container">
                <BrainWaveVisualizer
                  speed={activeWave.speed}
                  color={activeWave.color}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    right: 16,
                    background: "rgba(255,255,255,0.8)",
                    padding: "4px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Live Illustration
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeWave.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: activeWave.color,
                      }}
                    >
                      {activeWave.name}
                    </h3>
                    <span
                      style={{
                        fontSize: 14,
                        color: "var(--text-muted)",
                        background: "white",
                        padding: "2px 8px",
                        borderRadius: 4,
                        border: "1px solid var(--border)",
                      }}
                    >
                      {activeWave.freq}
                    </span>
                  </div>
                  <h4
                    style={{
                      fontSize: 18,
                      color: "var(--text-main)",
                      marginBottom: 12,
                    }}
                  >
                    Mental State: <strong>{activeWave.state}</strong>
                  </h4>
                  <p
                    style={{
                      fontSize: 16,
                      color: "var(--text-muted)",
                      lineHeight: 1.7,
                    }}
                  >
                    {activeWave.desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              style={{
                flex: 1,
                padding: 32,
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <Info color="var(--primary)" size={24} />
                <h3 style={{ fontWeight: 700 }}>Did you know?</h3>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Your brain waves change based on what you're doing.",
                  "Delta waves are most active during deep, dreamless sleep.",
                  "Alpha waves represent the 'idling' state of the brain.",
                  "Gamma waves are the fastest and represent complex multi-tasking.",
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      marginBottom: 16,
                      color: "var(--text-muted)",
                    }}
                  >
                    <CheckCircle2
                      size={18}
                      color="#22c55e"
                      style={{ flexShrink: 0 }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="experts">
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
            Leading Neurological Experts
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 18 }}>
            Our platform is vetted by top Neuroscientists and MDs worldwide.
          </p>
        </div>
        <div className="grid-3">
          {[1, 2, 3].map((i) => (
            <div className="card" key={i} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "var(--surface)",
                  margin: "0 auto 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Stethoscope size={48} color="var(--primary-light)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                Dr. {["Sarah Chen", "James Wilson", "Elena Rodriguez"][i - 1]}
              </h3>
              <p
                style={{
                  color: "var(--primary)",
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                {
                  [
                    "Neuro-Pathologist",
                    "Lead EEG Specialist",
                    "Brain-Behavior Expert",
                  ][i - 1]
                }
              </p>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                Specializing in{" "}
                {
                  [
                    "neural diagnostics and clinical data analysis",
                    "real-time biofeedback systems",
                    "cognitive rehabilitation through neuro-tech",
                  ][i - 1]
                }
                .
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
             <h3 style={{ fontSize: 28, fontWeight: 800 }}>Seamless Patient Experience</h3>
             <p style={{ color: 'var(--text-muted)', maxWidth: 600 }}>See how easy it is for patients to book appointments and connect with specialists.</p>
             <motion.div 
               style={{ maxWidth: 800, width: '100%', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
               initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
             >
              <video 
                src="WomanTakesNeurologistAppointment.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onError={(e) => {
                   e.currentTarget.src = "WomanTakesNeurologistAppointment.mp4";
                 }}
              />
             </motion.div>
          </div>
        </div>
      </section>

      <section className="login-container" id="auth-section">
        <div
          className="section"
          style={{ display: "flex", gap: 100, alignItems: "center" }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 48, fontWeight: 900, marginBottom: 24 }}>
              Ready to begin your{" "}
              <span style={{ color: "var(--primary)" }}>Journey?</span>
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "var(--text-muted)",
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              Join thousands of users who are already monitoring their cognitive
              health with NeuroEngage.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <CheckCircle2 color="#22c55e" size={20} />
                <span style={{ fontWeight: 600 }}>HIPAA Compliant</span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <CheckCircle2 color="#22c55e" size={20} />
                <span style={{ fontWeight: 600 }}>24/7 Monitoring</span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <CheckCircle2 color="#22c55e" size={20} />
                <span style={{ fontWeight: 600 }}>Expert Consultation</span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <CheckCircle2 color="#22c55e" size={20} />
                <span style={{ fontWeight: 600 }}>Secure Data</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: 460 }}>
            <div
              className="card"
              style={{
                padding: 40,
                background: "white",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ marginBottom: 32 }}>
                <h2
                  style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}
                >
                  {isRegistering ? "Create Account" : "Welcome Back"}
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--text-muted)",
                    margin: 0,
                  }}
                >
                  {isRegistering
                    ? "Register to start monitoring your brain health."
                    : "Sign in to access your telemetry dashboard."}
                </p>
              </div>

              <form onSubmit={handleAuth}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    marginBottom: 8,
                    display: "block",
                  }}
                >
                  Username
                </label>
                <input
                  className="login-input"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />

                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    marginBottom: 8,
                    display: "block",
                  }}
                >
                  Password
                </label>
                <input
                  className="login-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />

                {isRegistering && (
                  <div style={{ marginBottom: 20 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                        display: "block",
                      }}
                    >
                      Account Type
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        padding: 6,
                        borderRadius: 12,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setRole("subject")}
                        disabled={loading}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          background:
                            role === "subject" ? "white" : "transparent",
                          fontWeight: role === "subject" ? 700 : 500,
                          boxShadow:
                            role === "subject"
                              ? "0 2px 4px rgba(0,0,0,0.05)"
                              : "none",
                        }}
                      >
                        Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRole("manager");
                          setManagerCode("");
                        }}
                        disabled={loading}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          background:
                            role === "manager" ? "white" : "transparent",
                          fontWeight: role === "manager" ? 700 : 500,
                          boxShadow:
                            role === "manager"
                              ? "0 2px 4px rgba(0,0,0,0.05)"
                              : "none",
                        }}
                      >
                        Doctor
                      </button>
                    </div>
                  </div>
                )}

                {isRegistering && role === "subject" && (
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                        display: "block",
                      }}
                    >
                      Doctor's Pairing Code
                    </label>
                    <input
                      className="login-input"
                      type="text"
                      placeholder="6-DIGIT CODE"
                      value={managerCode}
                      onChange={(e) =>
                        setManagerCode(e.target.value.toUpperCase())
                      }
                      disabled={loading}
                      style={{
                        textAlign: "center",
                        letterSpacing: "0.25em",
                        fontFamily: "monospace",
                      }}
                    />
                  </div>
                )}

                {error && (
                  <div
                    style={{
                      padding: "12px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      borderRadius: 12,
                      fontSize: 14,
                      marginBottom: 20,
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    height: 52,
                  }}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : isRegistering ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary)",
                      fontWeight: 600,
                      cursor: "pointer",
                      position: "relative",
                      zIndex: 10,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsRegistering(!isRegistering);
                      setError("");
                    }}
                  >
                    {isRegistering
                      ? "Already have an account? Sign In"
                      : "Don't have an account? Register as Doctor/Patient"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer
        style={{
          padding: "60px 40px",
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          className="section"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BrainCircuit color="var(--primary)" size={32} />
            <span
              style={{
                fontWeight: 800,
                fontSize: 24,
                letterSpacing: "-0.02em",
              }}
            >
              NeuroEngage
            </span>
          </div>
          <p style={{ color: "var(--text-muted)" }}>
            © 2026 NeuroEngage Labs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
