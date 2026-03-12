import { useState, useEffect } from "react";

const SONG_SUGGESTIONS = [
  "Bohemian Rhapsody", "Don't Stop Believin'", "Sweet Caroline",
  "Total Eclipse of the Heart", "I Will Survive", "Livin' on a Prayer",
  "Africa", "Mr. Brightside", "Wonderwall", "Dancing Queen"
];

const ADMIN_PASSWORD = "oro1234";
const MAX_QUEUE = 15;

export default function KaraokePortal() {
  const [view, setView] = useState("portal");
  const [name, setName] = useState("");
  const [song, setSong] = useState("");
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem("karaokeQueue");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [submitted, setSubmitted] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [error, setError] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(() => {
    try {
      const saved = localStorage.getItem("karaokeNowPlaying");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [toast, setToast] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("karaokeQueue", JSON.stringify(queue));
  }, [queue]);

  // Save nowPlaying to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("karaokeNowPlaying", JSON.stringify(nowPlaying));
  }, [nowPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion(i => (i + 1) % SONG_SUGGESTIONS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const createSparkles = () => {
    const newSparkles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 12 + 6,
      duration: Math.random() * 1000 + 600,
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 1500);
  };

  const handleSubmit = () => {
    if (!name.trim()) { setError("Please enter your name!"); return; }
    if (!song.trim()) { setError("Please enter a song!"); return; }
    if (queue.length >= MAX_QUEUE) { setError("Queue is full! Please wait for a spot to open."); return; }
    setError("");
    setQueue(q => [...q, { name: name.trim(), song: song.trim(), id: Date.now(), status: "waiting" }]);
    createSparkles();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setName(""); setSong(""); }, 3000);
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setView("admin");
      setShowAdminLogin(false);
      setAdminPassword("");
      setAdminError("");
    } else {
      setAdminError("Wrong password. Try again.");
    }
  };

  const removeEntry = (id) => {
    setQueue(q => q.filter(e => e.id !== id));
    if (nowPlaying?.id === id) setNowPlaying(null);
    setRemoveConfirm(null);
    showToast("Performer removed from queue.");
  };

  const setStatus = (id, status) => {
    setQueue(q => q.map(e => e.id === id ? { ...e, status } : e));
  };

  const callToStage = (entry) => {
    setNowPlaying(entry);
    setStatus(entry.id, "performing");
    showToast(`🎤 ${entry.name} is now on stage!`);
  };

  const markDone = (id) => {
    setQueue(q => q.filter(e => e.id !== id));
    if (nowPlaying?.id === id) setNowPlaying(null);
    showToast("Performance complete! ⭐");
  };

  const clearAll = () => {
    setQueue([]);
    setNowPlaying(null);
    setShowClearConfirm(false);
    localStorage.removeItem("karaokeQueue");
    localStorage.removeItem("karaokeNowPlaying");
    showToast("Queue cleared for next event! 🎉");
  };

  const moveUp = (index) => {
    if (index === 0) return;
    setQueue(q => {
      const arr = [...q];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveDown = (index) => {
    setQueue(q => {
      if (index === q.length - 1) return q;
      const arr = [...q];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const waitingQueue = queue.filter(e => e.status === "waiting");
  const performingEntry = queue.find(e => e.status === "performing");
  const spotsLeft = MAX_QUEUE - queue.length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/background.avif') center/cover no-repeat",
      fontFamily: "'Georgia', serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Crimson+Text:ital@0;1&display=swap');
        @keyframes flicker {
          0%, 100% { opacity: 1; text-shadow: 0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 80px #ff00ff; }
          50% { opacity: 0.85; text-shadow: 0 0 10px #ff00ff, 0 0 30px #ff00ff; }
        }
        @keyframes sparkle-pop {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        @keyframes slide-up {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes success-bounce {
          0%, 100% { transform: scale(1); }
          30% { transform: scale(1.08); }
          60% { transform: scale(0.96); }
        }
        @keyframes toast-in {
          from { transform: translateY(20px) translateX(-50%); opacity: 0; }
          to { transform: translateY(0) translateX(-50%); opacity: 1; }
        }
        @keyframes now-playing-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,200,0,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(255,200,0,0); }
        }
        .neon-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,0,255,0.3);
          border-radius: 4px;
          color: #fff;
          font-family: 'Crimson Text', serif;
          font-size: 18px;
          padding: 14px 18px;
          width: 100%;
          box-sizing: border-box;
          outline: none;
          transition: all 0.3s;
        }
        .neon-input:focus {
          border-color: #ff00ff;
          box-shadow: 0 0 0 1px #ff00ff, 0 0 20px rgba(255,0,255,0.2);
        }
        .neon-input::placeholder { color: rgba(255,255,255,0.25); }
        .submit-btn {
          background: linear-gradient(135deg, #ff00ff, #8800ff);
          border: none; border-radius: 4px; color: white; cursor: pointer;
          font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700;
          letter-spacing: 0.1em; padding: 16px 40px; text-transform: uppercase;
          transition: all 0.2s; width: 100%;
        }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,0,255,0.4); }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .icon-btn {
          background: none; border: none; cursor: pointer; padding: 6px 10px;
          border-radius: 4px; transition: all 0.15s; font-size: 14px;
          display: flex; align-items: center; gap: 4px;
        }
        .queue-row {
          animation: slide-up 0.3s ease both;
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          margin-bottom: 8px;
          transition: background 0.2s;
        }
        .queue-row:hover { background: rgba(255,255,255,0.06); }
        .tab-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Playfair Display', serif; font-size: 13px;
          letter-spacing: 0.15em; text-transform: uppercase;
          padding: 8px 20px; border-radius: 4px; transition: all 0.2s;
        }
      `}</style>

      {[
        { top: "-20%", left: "-10%", color: "rgba(136,0,255,0.15)" },
        { bottom: "-20%", right: "-10%", color: "rgba(255,0,136,0.12)" },
        { top: "40%", right: "-15%", color: "rgba(0,200,255,0.08)" },
      ].map((orb, i) => (
        <div key={i} style={{
          position: "fixed", width: 600, height: 600, borderRadius: "50%",
          background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
          ...orb, pointerEvents: "none",
        }} />
      ))}

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)"
      }} />

      {sparkles.map(s => (
        <div key={s.id} style={{
          position: "fixed", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, pointerEvents: "none", zIndex: 200,
          animation: `sparkle-pop ${s.duration}ms ease forwards`, fontSize: s.size, lineHeight: 1,
        }}>✦</div>
      ))}

      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%",
          transform: "translateX(-50%)",
          background: toast.type === "success" ? "rgba(255,0,255,0.15)" : "rgba(255,80,80,0.15)",
          border: `1px solid ${toast.type === "success" ? "rgba(255,0,255,0.4)" : "rgba(255,80,80,0.4)"}`,
          backdropFilter: "blur(12px)",
          borderRadius: 6, padding: "12px 24px",
          color: "#fff", fontFamily: "'Crimson Text', serif", fontSize: 16,
          zIndex: 300, whiteSpace: "nowrap",
          animation: "toast-in 0.3s ease",
        }}>{toast.msg}</div>
      )}

      {showAdminLogin && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 400, backdropFilter: "blur(6px)",
        }} onClick={() => { setShowAdminLogin(false); setAdminError(""); setAdminPassword(""); }}>
          <div style={{
            background: "#120020", border: "1px solid rgba(255,0,255,0.3)",
            borderRadius: 8, padding: 32, width: 320,
            animation: "slide-up 0.3s ease",
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", margin: "0 0 6px", fontSize: 22 }}>
              🔐 Host / Admin Access
            </h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Crimson Text', serif", fontStyle: "italic", margin: "0 0 20px", fontSize: 15 }}>
              Enter the password to continue
            </p>
            <input
              className="neon-input"
              type="password"
              placeholder="Password..."
              value={adminPassword}
              onChange={e => { setAdminPassword(e.target.value); setAdminError(""); }}
              onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
              autoFocus
              style={{ marginBottom: 12 }}
            />
            {adminError && (
              <div style={{ color: "#ff6666", fontFamily: "'Crimson Text', serif", fontStyle: "italic", fontSize: 14, marginBottom: 12 }}>
                ⚠ {adminError}
              </div>
            )}
            <button className="submit-btn" onClick={handleAdminLogin} style={{ fontSize: 15, padding: "13px 20px" }}>
              Enter Console →
            </button>
          </div>
        </div>
      )}

      {removeConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 400, backdropFilter: "blur(6px)",
        }}>
          <div style={{
            background: "#120020", border: "1px solid rgba(255,80,80,0.4)",
            borderRadius: 8, padding: 28, width: 300, textAlign: "center",
            animation: "slide-up 0.2s ease",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <p style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 18, margin: "0 0 6px" }}>
              Remove {removeConfirm.name}?
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Crimson Text', serif", fontStyle: "italic", fontSize: 15, margin: "0 0 20px" }}>
              "{removeConfirm.song}"
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setRemoveConfirm(null)} style={{
                flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 4, color: "rgba(255,255,255,0.6)", cursor: "pointer",
                fontFamily: "'Playfair Display', serif", fontSize: 14, padding: "11px",
              }}>Cancel</button>
              <button onClick={() => removeEntry(removeConfirm.id)} style={{
                flex: 1, background: "rgba(255,60,60,0.2)", border: "1px solid rgba(255,60,60,0.5)",
                borderRadius: 4, color: "#ff8888", cursor: "pointer",
                fontFamily: "'Playfair Display', serif", fontSize: 14, padding: "11px",
              }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 400, backdropFilter: "blur(6px)",
        }}>
          <div style={{
            background: "#120020", border: "1px solid rgba(255,80,80,0.4)",
            borderRadius: 8, padding: 28, width: 300, textAlign: "center",
            animation: "slide-up 0.2s ease",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🧹</div>
            <p style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 18, margin: "0 0 6px" }}>
              Clear entire queue?
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Crimson Text', serif", fontStyle: "italic", fontSize: 15, margin: "0 0 20px" }}>
              This will remove all performers. Use for a fresh event.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowClearConfirm(false)} style={{
                flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 4, color: "rgba(255,255,255,0.6)", cursor: "pointer",
                fontFamily: "'Playfair Display', serif", fontSize: 14, padding: "11px",
              }}>Cancel</button>
              <button onClick={clearAll} style={{
                flex: 1, background: "rgba(255,60,60,0.2)", border: "1px solid rgba(255,60,60,0.5)",
                borderRadius: 4, color: "#ff8888", cursor: "pointer",
                fontFamily: "'Playfair Display', serif", fontSize: 14, padding: "11px",
              }}>Clear All</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: view === "admin" ? 620 : 480, position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 6 }}>🎤</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(32px, 7vw, 50px)", fontWeight: 900,
            margin: 0, color: "#fff",
            animation: "flicker 3s ease-in-out infinite",
            letterSpacing: "-0.02em",
          }}>KARAOKE</h1>
          <div style={{
            fontFamily: "'Crimson Text', serif", fontStyle: "italic",
            color: "rgba(255,255,255,0.4)", fontSize: 15,
            letterSpacing: "0.4em", textTransform: "uppercase", marginTop: 4,
          }}>{view === "admin" ? "Host / Admin Console" : "Sign-Up Portal"}</div>
          <div style={{
            width: 60, height: 1,
            background: "linear-gradient(90deg, transparent, #ff00ff, transparent)",
            margin: "14px auto 0",
          }} />
        </div>

        <div style={{
          display: "flex", background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
          padding: 4, marginBottom: 24, gap: 4,
        }}>
          {["portal", "admin"].map(v => (
            <button key={v} className="tab-btn"
              onClick={() => v === "admin" ? (view === "admin" ? null : setShowAdminLogin(true)) : setView("portal")}
              style={{
                flex: 1,
                color: view === v ? "#fff" : "rgba(255,255,255,0.35)",
                background: view === v ? "rgba(255,0,255,0.2)" : "none",
                border: view === v ? "1px solid rgba(255,0,255,0.3)" : "1px solid transparent",
              }}>
              {v === "portal" ? "🎙 Sign Up" : "🎛 Host / Admin"}
            </button>
          ))}
        </div>

        {view === "portal" && (
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "32px", backdropFilter: "blur(20px)",
            animation: submitted ? "success-bounce 0.6s ease" : "none",
          }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🌟</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#ff00ff", fontSize: 28, margin: "0 0 8px" }}>
                  You're on the list!
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Crimson Text', serif", fontSize: 18, margin: 0 }}>
                  Get ready to shine on stage ✨
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Spots indicator */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: spotsLeft <= 3 ? "rgba(255,100,0,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${spotsLeft <= 3 ? "rgba(255,100,0,0.3)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 4, padding: "10px 14px",
                }}>
                  <span style={{ fontFamily: "'Crimson Text', serif", color: "rgba(255,255,255,0.6)", fontSize: 15 }}>
                    Queue spots
                  </span>
                  <span style={{
                    fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15,
                    color: spotsLeft <= 3 ? "#ff6600" : "#00ccff",
                  }}>
                    {spotsLeft} / {MAX_QUEUE} available
                  </span>
                </div>

                {[
                  { label: "Your Name", val: name, set: setName, ph: "Stage name or real name..." },
                  { label: "Song Choice", val: song, set: setSong, ph: `e.g. ${SONG_SUGGESTIONS[currentSuggestion]}` },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label style={{
                      display: "block", fontFamily: "'Playfair Display', serif",
                      color: "rgba(255,255,255,0.6)", fontSize: 11,
                      letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8,
                    }}>{label}</label>
                    <input className="neon-input" placeholder={ph} value={val}
                      onChange={e => { set(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      disabled={spotsLeft === 0} />
                  </div>
                ))}
                {error && (
                  <div style={{ color: "#ff6666", fontFamily: "'Crimson Text', serif", fontStyle: "italic", fontSize: 15, textAlign: "center" }}>
                    ⚠ {error}
                  </div>
                )}
                {spotsLeft === 0 && (
                  <div style={{ textAlign: "center", padding: "10px", background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.3)", borderRadius: 4 }}>
                    <span style={{ color: "#ff8888", fontFamily: "'Crimson Text', serif", fontStyle: "italic", fontSize: 16 }}>
                      🚫 Queue is full! Please wait for a spot to open.
                    </span>
                  </div>
                )}
                <button className="submit-btn" onClick={handleSubmit} disabled={spotsLeft === 0}>
                  Take the Stage →
                </button>
              </div>
            )}
          </div>
        )}

        {view === "admin" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { label: "In Queue", value: waitingQueue.length, color: "#ff00ff" },
                { label: "On Stage", value: performingEntry ? 1 : 0, color: "#ffd700" },
                { label: "Total Tonight", value: queue.length, color: "#00ccff" },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 6, padding: "14px 16px", textAlign: "center",
                }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </div>
                  <div style={{ fontFamily: "'Crimson Text', serif", color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {performingEntry && (
              <div style={{
                background: "rgba(255,200,0,0.08)", border: "1px solid rgba(255,200,0,0.35)",
                borderRadius: 8, padding: "16px 20px",
                animation: "now-playing-pulse 2s ease infinite",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              }}>
                <div>
                  <div style={{ color: "#ffd700", fontFamily: "'Playfair Display', serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                    🎤 Now Performing
                  </div>
                  <div style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700 }}>
                    {performingEntry.name}
                  </div>
                  <div style={{ color: "rgba(255,200,0,0.7)", fontFamily: "'Crimson Text', serif", fontStyle: "italic", fontSize: 15 }}>
                    {performingEntry.song}
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    onChange={() => markDone(performingEntry.id)}
                    style={{ width: 20, height: 20, cursor: "pointer", accentColor: "#ffd700" }}
                  />
                  <span style={{ color: "#ffd700", fontFamily: "'Playfair Display', serif", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Mark Done
                  </span>
                </label>
              </div>
            )}

            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8, overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: "'Playfair Display', serif", color: "rgba(255,255,255,0.7)", fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Waiting Queue
                </span>
                {waitingQueue.length === 0 && (
                  <span style={{ fontFamily: "'Crimson Text', serif", fontStyle: "italic", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                    Empty — add performers via the sign-up portal
                  </span>
                )}
              </div>
              <div style={{ padding: 12, maxHeight: 380, overflowY: "auto" }}>
                {waitingQueue.map((entry, index) => (
                  <div key={entry.id} className="queue-row" style={{ animationDelay: `${index * 40}ms` }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: index === 0 ? "rgba(255,0,255,0.2)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${index === 0 ? "rgba(255,0,255,0.4)" : "rgba(255,255,255,0.1)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Playfair Display', serif",
                      color: index === 0 ? "#ff00ff" : "rgba(255,255,255,0.4)",
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>{index + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {entry.name}
                      </div>
                      <div style={{ color: "rgba(255,0,255,0.6)", fontFamily: "'Crimson Text', serif", fontStyle: "italic", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {entry.song}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button className="icon-btn" onClick={() => moveUp(queue.findIndex(e => e.id === entry.id))}
                        style={{ color: index === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)" }}>▲</button>
                      <button className="icon-btn" onClick={() => moveDown(queue.findIndex(e => e.id === entry.id))}
                        style={{ color: index === waitingQueue.length - 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)" }}>▼</button>
                      <button className="icon-btn" onClick={() => callToStage(entry)}
                        disabled={!!performingEntry}
                        style={{
                          color: performingEntry ? "rgba(255,255,255,0.15)" : "#ffd700",
                          background: performingEntry ? "none" : "rgba(255,200,0,0.1)",
                          border: performingEntry ? "1px solid transparent" : "1px solid rgba(255,200,0,0.2)",
                          fontSize: 13, padding: "5px 10px",
                        }}>🎤 Stage</button>
                      <button className="icon-btn" onClick={() => setRemoveConfirm(entry)}
                        style={{ color: "#ff6666", background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.2)", fontSize: 13, padding: "5px 10px" }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setShowClearConfirm(true)} style={{
              background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.3)",
              borderRadius: 4, color: "#ff8888", cursor: "pointer",
              fontFamily: "'Playfair Display', serif", fontSize: 13,
              letterSpacing: "0.1em", padding: "12px", textTransform: "uppercase",
              width: "100%", transition: "all 0.2s",
            }}>
              🧹 Clear All — Start Fresh Event
            </button>

            <button onClick={() => setView("portal")} style={{
              background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4,
              color: "rgba(255,255,255,0.4)", cursor: "pointer",
              fontFamily: "'Playfair Display', serif", fontSize: 13,
              letterSpacing: "0.1em", padding: "10px", textTransform: "uppercase",
            }}>
              ← Back to Sign-Up Portal
            </button>
          </div>
        )}

        <div style={{
          textAlign: "center", marginTop: 20,
          fontFamily: "'Crimson Text', serif", fontStyle: "italic",
          color: "rgba(255,255,255,0.2)", fontSize: 13,
        }}>
          Every voice deserves a spotlight ✦
        </div>
      </div>
    </div>
  );
}