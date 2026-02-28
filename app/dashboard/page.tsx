"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessions, deleteAllSessions, getCurrentUser, calculateStreak } from "@/lib/storage";
import { Session } from "@/types/session";

function getNoteColor(note: number): string {
  if (note >= 8) return "#27AE60";
  if (note >= 5) return "#A67B5B";
  return "#C0392B";
}

function SessionCard({ session }: { session: Session }) {
  const [showCorrection, setShowCorrection] = useState(false);

  return (
    <div className="session-item">
      <div className="session-meta">
        <span className="session-date">{session.date}</span>
        <span className="session-note" style={{ background: getNoteColor(session.note) }}>
          {session.note}/10
        </span>
      </div>
      <div className="session-topic">{session.topic}</div>
      {session.audioUrl && (
        <>
          <p className="audio-label">🎧 Reecouter</p>
          <audio className="audio-player" controls preload="metadata" src={session.audioUrl}>
            <source src={session.audioUrl} type="audio/webm" />
            <source src={session.audioUrl} type="audio/mp4" />
          </audio>
        </>
      )}
      {session.correction && (
        <div style={{ marginTop: "0.75rem" }}>
          {!showCorrection ? (
            <button
              onClick={() => setShowCorrection(true)}
              style={{
                width: "100%", padding: "0.6rem", borderRadius: "10px",
                border: "1.5px solid var(--btn)", background: "transparent",
                color: "var(--btn)", fontFamily: "Lato, sans-serif",
                fontSize: "0.85rem", fontWeight: "700", cursor: "pointer",
              }}
            >
              ✏️ Voir la correction IA
            </button>
          ) : (
            <div style={{ background: "var(--bg)", borderRadius: "12px", padding: "1rem", borderLeft: "3px solid var(--btn)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--btn)", marginBottom: "0.5rem" }}>
                ✅ Texte corrige
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: "1.6" }}>
                {session.correction}
              </p>
              <button
                onClick={() => setShowCorrection(false)}
                style={{ marginTop: "0.5rem", background: "none", border: "none", color: "var(--muted)", fontSize: "0.8rem", cursor: "pointer", fontFamily: "Lato, sans-serif" }}
              >
                Masquer
              </button>
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

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

  async function handleDeleteAll() {
    if (!user) return;
    await deleteAllSessions(user);
    setSessions([]);
    setStreak(0);
    setConfirmDelete(false);
    localStorage.removeItem("lastSession");
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
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}

        {sessions.length > 0 && (
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            {!confirmDelete ? (
              <button
                className="btn btn-ghost"
                style={{ color: "#C0392B", borderColor: "#C0392B" }}
                onClick={() => setConfirmDelete(true)}
              >
                🗑️ Effacer toutes mes seances
              </button>
            ) : (
              <>
                <p style={{ textAlign: "center", fontSize: "0.9rem" }}>Confirmer la suppression ?</p>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button className="btn" style={{ background: "#C0392B", marginTop: 0 }} onClick={handleDeleteAll}>
                    Oui, effacer
                  </button>
                  <button className="btn btn-ghost" style={{ marginTop: 0 }} onClick={() => setConfirmDelete(false)}>
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <ResetTimer />
      </div>
    </div>
  );
}

function ResetTimer() {
  const [code, setCode] = useState("");
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState("");

  function handleReset() {
    if (code === "4416") {
      localStorage.removeItem("lastSession");
      setMsg("Timer reinitialise !");
      setCode("");
      setTimeout(() => setMsg(""), 3000);
    } else {
      setMsg("Code incorrect.");
      setTimeout(() => setMsg(""), 2000);
    }
  }

  return (
    <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
      {!visible ? (
        <button className="btn btn-ghost" style={{ fontSize: "0.8rem", color: "var(--muted)" }} onClick={() => setVisible(true)}>
          🔒 Reinitialiser le timer
        </button>
      ) : (
        <div>
          <p style={{ fontSize: "0.85rem", textAlign: "center", marginBottom: "0.5rem" }}>Entre le code secret</p>
          <input
            type="password"
            placeholder="Code..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReset()}
            style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1.5px solid var(--border)", fontFamily: "Lato, sans-serif", fontSize: "1rem", background: "var(--bg)", textAlign: "center", outline: "none", marginBottom: "0.5rem" }}
          />
          {msg && (
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: msg.includes("reinitialise") ? "#27AE60" : "#C0392B", marginBottom: "0.5rem" }}>
              {msg}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn" style={{ marginTop: 0 }} onClick={handleReset}>Valider</button>
            <button className="btn btn-ghost" style={{ marginTop: 0 }} onClick={() => { setVisible(false); setCode(""); setMsg(""); }}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}