"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessions, getCurrentUser, calculateStreak } from "@/lib/storage";
import { Session } from "@/types/session";

function getNoteColor(note: number): string {
  if (note >= 8) return "#27AE60";
  if (note >= 5) return "#A67B5B";
  return "#C0392B";
}

function SessionCard({ session, onDelete }: { session: Session; onDelete: (id: string) => void }) {
  const [showCorrection, setShowCorrection] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="session-item">
      {/* Header */}
      <div className="session-meta">
        <span className="session-date">{session.date}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="session-note" style={{ background: getNoteColor(session.note) }}>
            {session.note}/10
          </span>
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#E74C3C", opacity: 0.8, padding: "0.1rem" }}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div style={{ background: "#E74C3C11", border: "1.5px solid #E74C3C", borderRadius: "10px", padding: "0.75rem", marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.82rem", color: "#E74C3C", margin: 0, fontWeight: "700" }}>
            Supprimer cette seance ?
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => onDelete(session.id)} style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", border: "none", background: "#E74C3C", color: "#fff", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}>
              Oui
            </button>
            <button onClick={() => setConfirmDelete(false)} style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", border: "1.5px solid var(--border)", background: "transparent", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}>
              Non
            </button>
          </div>
        </div>
      )}

      <div className="session-topic">{session.topic}</div>

      {/* Audio */}
      {session.audioUrl && (
        <>
          <p className="audio-label">🎧 Reécouter</p>
          <audio className="audio-player" controls preload="metadata" src={session.audioUrl}>
            <source src={session.audioUrl} type="audio/webm" />
            <source src={session.audioUrl} type="audio/mp4" />
          </audio>
        </>
      )}

      {/* Texte écrit */}
      {session.text && (
        <>
          <p className="audio-label">✍️ Revoir le texte</p>
          <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem", marginTop: "0.5rem", whiteSpace: "pre-wrap", fontSize: "0.9rem", maxHeight: "200px", overflowY: "auto" }}>
            {session.text}
          </div>
        </>
      )}

      {/* Correction masquable */}
      {session.correction && (
        <div style={{ marginTop: "0.75rem" }}>
          {!showCorrection ? (
            <button
              onClick={() => setShowCorrection(true)}
              style={{ width: "100%", padding: "0.6rem", borderRadius: "10px", border: "1.5px solid var(--btn)", background: "transparent", color: "var(--btn)", fontFamily: "Lato, sans-serif", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer" }}
            >
              ✏️ Voir la correction IA
            </button>
          ) : (
            <div style={{ background: "var(--bg)", borderRadius: "12px", padding: "1rem", borderLeft: "3px solid var(--btn)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--btn)", margin: 0 }}>
                  ✅ Texte corrige
                </p>
                <button onClick={() => setShowCorrection(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "Lato, sans-serif" }}>
                  Masquer ✕
                </button>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: "1.6", margin: 0 }}>
                {session.correction}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [user, setUser] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [showResetInput, setShowResetInput] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) { router.push("/login"); return; }
    setUser(currentUser);
    getSessions(currentUser).then((data) => {
      setSessions(data);
      setStreak(calculateStreak(data));
      setLoadingData(false);
    });
  }, []);

  async function handleDeleteOne(id: string) {
    const { supabase } = await import("@/lib/supabase");
    await supabase.from("sessions").delete().eq("id", id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  function handleResetTimer() {
    if (resetCode === "4416") {
      localStorage.removeItem("lastSession");
      setResetMsg("✅ Timer reinitialise !");
      setResetCode("");
      setTimeout(() => setResetMsg(null), 3000);
    } else {
      setResetMsg("❌ Code incorrect");
      setTimeout(() => setResetMsg(null), 2000);
    }
  }

  const avg = sessions.length
    ? (sessions.reduce((s, x) => s + x.note, 0) / sessions.length).toFixed(1)
    : "-";
  const best = sessions.length ? Math.max(...sessions.map((s) => s.note)) : "-";

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="nav-top">
          <button className="back-btn" onClick={() => router.push("/")}>&larr;</button>
          <div className="logo" style={{ margin: 0 }}>Mes seances</div>
          <div style={{ width: 24 }} />
        </div>

        <div className="stat-row">
          <div className="stat-card">
            <div className="val">{avg}</div>
            <div className="lbl">Moyenne</div>
          </div>
          <div className="stat-card">
            <div className="val">{sessions.length}</div>
            <div className="lbl">Seances</div>
          </div>
          <div className="stat-card">
            <div className="val">{best}</div>
            <div className="lbl">Meilleure</div>
          </div>
        </div>

        {loadingData ? (
          <div className="empty-state"><p>⏳ Chargement...</p></div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎙️</div>
            <p>Aucune seance pour l instant. Lance-toi !</p>
            <button className="btn" style={{ maxWidth: 200, margin: "1rem auto 0" }} onClick={() => router.push("/")}>
              Commencer
            </button>
          </div>
        ) : (
          <div>
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} onDelete={handleDeleteOne} />
            ))}
          </div>
        )}

        {/* Reset timer — style identique à exprimer */}
        <div style={{ height: "1px", background: "var(--border)", margin: "1.5rem 0" }} />

        <div style={{ marginBottom: "1rem" }}>
          <button
            onClick={() => setShowResetInput(!showResetInput)}
            style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "Lato, sans-serif", width: "100%", textAlign: "center" }}
          >
            🔒 {showResetInput ? "Masquer" : "Reinitialiser le timer"}
          </button>

          {showResetInput && (
            <div style={{ marginTop: "0.75rem", background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0 0 0.75rem 0", textAlign: "center" }}>
                Entre le code pour debloquer une nouvelle seance
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="password"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetTimer()}
                  placeholder="Code..."
                  maxLength={4}
                  style={{ flex: 1, padding: "0.6rem 0.75rem", borderRadius: "8px", border: "1.5px solid var(--border)", background: "var(--card)", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "1rem", outline: "none", textAlign: "center", letterSpacing: "0.3em" }}
                />
                <button
                  onClick={handleResetTimer}
                  style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: "none", background: "var(--btn)", color: "#fff", fontFamily: "Lato, sans-serif", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer" }}
                >
                  OK
                </button>
              </div>
              {resetMsg && (
                <p style={{ fontSize: "0.82rem", color: resetMsg.startsWith("✅") ? "#27AE60" : "#E74C3C", textAlign: "center", margin: "0.75rem 0 0", fontWeight: "700" }}>
                  {resetMsg}
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}