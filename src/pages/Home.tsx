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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Clean Light Theme CSS ── */
const pageStyles = `
  :root {
    --primary: #BF77F6;
    --primary-light: #BF77F6;
    --secondary: #BF77F6;
    --background: #ffffff;
    --surface: #f8fafc;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --accent: #BF77F6;
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
    background: #BF77F6;
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
    .hero-section { 
      flex-direction: column; 
      text-align: center; 
      padding-top: 120px; 
      min-height: auto; /* Removes the massive vertical stretch */
      gap: 10px; /* Pulls the image closer to the text */
      padding-bottom: 40px;
    }
    .hero-content, .hero-visual { 
      flex: none; /* Stops them from splitting the screen height 50/50 */
      width: 100%; 
    }
    .nav-bar { padding: 0 20px; }
    .hero-buttons {
      justify-content: center; /* Centers the buttons on mobile */
      flex-wrap: wrap; /* Allows buttons to wrap on very small screens */
    }
  }
`;

const BRAIN_WAVES = [
  {
    id: "delta",
    name: "Delta Waves",
    freq: "0.5–4 Hz",
    state: "Deep Sleep",
    color: "#BF77F6",
    desc: "Associated with the deepest levels of relaxation and restorative, healing sleep. They are found most often in infants and young children.",
    speed: 1,
  },
  {
    id: "theta",
    name: "Theta Waves",
    freq: "4–8 Hz",
    state: "Meditation / REM Sleep",
    color: "#BF77F6",
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

const EXPERTS = [
  {
    name: "Dr. Sarah Chen",
    role: "Neuro-Pathologist",
    quote: "The brain is the body's most complex frontier. We are here to map it, together."
  },
  {
    name: "Dr. James Wilson",
    role: "Lead EEG Specialist",
    quote: "True healthcare requires listening not just to words, but to neural pathways."
  },
  {
    name: "Dr. Elena Rodriguez",
    role: "Brain-Behavior Expert",
    quote: "Healing begins when we can accurately visualize the invisible signals of stress."
  }
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
  const [showSplash, setShowSplash] = useState(true);
  const [activeWave, setActiveWave] = useState(BRAIN_WAVES[2]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [doctorCode, setDoctorCode] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Control Splash Screen Animation
  useEffect(() => {
    // Hide scrolling while splash screen is active
    if (showSplash) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // 2.5 seconds of purple splash screen

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "unset";
    };
  }, [showSplash]);

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
          doctorCode: role === "patient" ? doctorCode : undefined,
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
      localStorage.setItem("neuro_doctor_code", data.doctorCode || "");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="home-root">
      <style>{pageStyles}</style>

      {/* ─── CINEMATIC SPLASH SCREEN ─── */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{
              position: "fixed",
              inset: 0,
              background: "var(--primary)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.img
              layoutId="neural-hero-gif" // This matches the ID of the image in the hero section below!
              src="https://cdn.dribbble.com/userupload/44366577/file/29261ea2f21de39cc959d5cd1c78c04e.gif"
              alt="Neural Visualization Initializing"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{
                width: "40vw",
                minWidth: "300px",
                mixBlendMode: "multiply", // Makes the white background transparent against the purple
                WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 75%)",
                maskImage: "radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 75%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
        <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <a
            href="#services"
            style={{
              textDecoration: "none",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            Clinical Services
          </a>
          <a
            href="#brain-tutor"
            style={{
              textDecoration: "none",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            Your Brain Health
          </a>
          <a
            href="#experts"
            style={{
              textDecoration: "none",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            Our Specialists
          </a>
          <button
            className="btn-primary"
            onClick={() =>
              document
                .getElementById("auth-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Patient / Doctor Portal
          </button>
        </div>
      </nav>

      <section className="section hero-section">
        <div className="hero-content">
          <span className="badge badge-primary">Clinical-Grade Neurological Care</span>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Empowering Minds.{" "}
            <span style={{ color: "var(--primary)" }}>Connecting Care.</span>
          </h1>
          <p
            style={{
              fontSize: 20,
              color: "var(--text-muted)",
              lineHeight: 1.6,
              marginBottom: 40,
            }}
          >
            Translating your brain waves into a language of healing. Advanced EEG telemetry and cognitive assessment designed to bridge the gap between neural insights and clinical action.
          </p>
          <div className="hero-buttons" style={{ display: "flex", gap: 16 }}>
            <button
              className="btn-primary"
              onClick={() =>
                document
                  .getElementById("auth-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Book Consultation <ArrowRight size={18} />
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("services")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                padding: "14px 28px",
                borderRadius: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Explore the Platform
            </button>
          </div>
        </div>
        <div className="hero-visual" style={{ position: "relative" }}>
          {!showSplash && (
            <motion.div
              style={{
                width: "120%",
                left: "-10%",
                position: "relative",
                zIndex: 0,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, -15, 0] }}
              transition={{
                y: {
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut",
                  delay: 1.5, // Waits for the layoutId transition to finish flying in before it starts floating
                },
                opacity: { duration: 0.5 },
              }}
            >
              <motion.img
                layoutId="neural-hero-gif" // This matches the Splash Screen, allowing it to fly perfectly into place!
                src="https://cdn.dribbble.com/userupload/44366577/file/29261ea2f21de39cc959d5cd1c78c04e.gif"
                alt="Neural Visualization"
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  mixBlendMode: "multiply",
                  WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 75%)",
                  maskImage: "radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 75%)",
                }}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHR4M3NyeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lTfuxs659E8JLW/giphy.gif";
                }}
              />
            </motion.div>
          )}
        </div>
      </section>

      <section className="section" id="services">
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
            Advanced Neurological Diagnostics
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 18,
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            From continuous EEG monitoring to ML-powered stress analysis—we empower clinical decisions and patient well-being.
          </p>
        </div>
        <div className="grid-3">
          <div className="card">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#BF77F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Activity color="#BF77F6" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              Real-time Neural Telemetry
            </h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Live stream brain wave data with millisecond precision directly from your wearable device into a secure clinical portal.
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
              Cognitive Stress Profiling
            </h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Identify subtle anxiety triggers and track mental fatigue through our advanced ML-powered classification engine.
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
              Seamless Doctor Collaboration
            </h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              Beyond the symptoms: Connect patients and doctors in a unified workspace for holistic, data-driven diagnostic outcomes.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="brain-tutor">
        <div className="brain-wave-tutor">
          <div style={{ display: "flex", gap: 60, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 400px" }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
                Understand Your Cognitive Health
              </h2>
              <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
                Your mental well-being is no longer a guessing game. See the science behind your state of mind by exploring your neural frequencies below.
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
                  Clinical Illustration
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
                    Associated Clinical State: <strong>{activeWave.state}</strong>
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
                flex: "1 1 300px",
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
                <Stethoscope color="var(--primary)" size={24} />
                <h3 style={{ fontWeight: 700 }}>Medical Insights</h3>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Your neural pathways adapt continuously to environmental stressors.",
                  "Chronic stress can suppress Alpha wave generation.",
                  "Delta wave abnormalities may indicate severe sleep disorders.",
                  "Our platform analyzes these fluctuations to guide clinical interventions.",
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
                    <span style={{ lineHeight: 1.4 }}>{item}</span>
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
            Trusted Neurological Specialists
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 18 }}>
            Our platform connects you with world-class medical professionals dedicated to your mental well-being.
          </p>
        </div>
        <div className="grid-3">
          {EXPERTS.map((expert, i) => (
            <div className="card" key={i} style={{ textAlign: "center", display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "var(--surface)",
                  margin: "0 auto 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Stethoscope size={40} color="var(--primary-light)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                {expert.name}
              </h3>
              <p
                style={{
                  color: "var(--primary)",
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 24,
                }}
              >
                {expert.role}
              </p>
              <blockquote
                style={{
                  margin: "auto 0 0 0",
                  fontStyle: "italic",
                  color: "var(--text-muted)",
                  fontSize: 15,
                  lineHeight: 1.6,
                  borderTop: "1px solid var(--border)",
                  paddingTop: 20,
                }}
              >
                "{expert.quote}"
              </blockquote>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <h3 style={{ fontSize: 28, fontWeight: 800 }}>Bridging the Gap to Better Care</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 600 }}>
              Seamlessly connect with your neurological specialist, share real-time cognitive telemetry, and manage your health from the comfort of your own home.
            </p>
            
            <motion.div
              style={{ 
                maxWidth: 800, 
                width: '100%', 
                position: 'relative', 
                zIndex: 0 
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1, y: [0, -15, 0] }} 
              viewport={{ once: true }}
              transition={{ 
                duration: 1.2, 
                y: { 
                  repeat: Infinity, 
                  duration: 6, 
                  ease: "easeInOut" 
                }
              }}
            >
              <img
                src="https://drparagagarwal.co.in/wp-content/uploads/2022/05/24867-online-doctor-app.gif"
                alt="Seamless Patient Experience"
                style={{ 
                  width: '60%', 
                  height: 'auto', 
                  display: 'block',
                  margin: '0 auto',
                  mixBlendMode: 'multiply',
                  WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
                  maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)'
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="login-container" id="auth-section">
        <div
          className="section"
          style={{ display: "flex", gap: 100, alignItems: "center", flexWrap: "wrap" }}
        >
          <div style={{ flex: "1 1 400px" }}>
            <h2 style={{ fontSize: 48, fontWeight: 900, marginBottom: 24 }}>
              Take Control of Your <br/>
              <span style={{ color: "var(--primary)" }}>Cognitive Health</span>
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "var(--text-muted)",
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              Every wave tells a story. Join our secure platform to monitor your neural data, connect with your doctor, or manage your clinical practice.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                <span style={{ fontWeight: 600 }}>Secure Data Encryption</span>
              </div>
            </div>
          </div>

          <div style={{ flex: "1 1 400px", maxWidth: 460, margin: "0 auto" }}>
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
                  {isRegistering ? "Create Patient/Provider Account" : "Access Clinical Portal"}
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--text-muted)",
                    margin: 0,
                  }}
                >
                  {isRegistering
                    ? "Register to connect with your specialist or patients."
                    : "Sign in to access your secure telemetry dashboard."}
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
                        onClick={() => setRole("patient")}
                        disabled={loading}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          background:
                            role === "patient" ? "white" : "transparent",
                          fontWeight: role === "patient" ? 700 : 500,
                          boxShadow:
                            role === "patient"
                              ? "0 2px 4px rgba(0,0,0,0.05)"
                              : "none",
                        }}
                      >
                        Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRole("doctor");
                          setDoctorCode("");
                        }}
                        disabled={loading}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          background:
                            role === "doctor" ? "white" : "transparent",
                          fontWeight: role === "doctor" ? 700 : 500,
                          boxShadow:
                            role === "doctor"
                              ? "0 2px 4px rgba(0,0,0,0.05)"
                              : "none",
                        }}
                      >
                        Doctor
                      </button>
                    </div>
                  </div>
                )}

                {isRegistering && role === "patient" && (
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
                      Doctor's Clinical Pairing Code
                    </label>
                    <input
                      className="login-input"
                      type="text"
                      placeholder="6-DIGIT CODE"
                      value={doctorCode}
                      onChange={(e) =>
                        setDoctorCode(e.target.value.toUpperCase())
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
                    "Register Profile"
                  ) : (
                    "Enter Secure Portal"
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
                      : "New Patient or Doctor? Register Here"}
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
            flexWrap: "wrap",
            gap: 20
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
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            © 2026 NeuroEngage Clinical Systems. All rights reserved. <br/>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Not intended to replace emergency medical services.</span>
          </p>
        </div>
      </footer>
    </div>
  );
};