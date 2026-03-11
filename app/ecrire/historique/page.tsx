"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessions, getCurrentUser } from "@/lib/storage";
import { Session } from "@/types/session";

function SessionCard({ session }: { session: Session }) {
  const [showCorrection, setShowCorrection] = useState(false);

  return (
    <div className="session-item">
      <div className="session-meta">
        <span className="session-date">{session.date}</span>
        <span className="session-type">Écriture</span>
      </div>
      <div className="session-topic">{session.topic}</div>

      {session.text && (
        <>
          <p className="audio-label">✍️ Texte écrit</p>
          <div style={{
            background: "var(--bg)",
            border: "1.5px solid var(--border)",
            borderRadius: "12px",
            padding: "1rem",
            marginTop: "0.5rem",
            whiteSpace: "pre-wrap",
            fontSize: "0.9rem",
            maxHeight: "200px",
            overflowY: "auto"
          }}>
            {session.text}
          </div>
        </>
      )}

      {session.correction && (
        <div style={{ marginTop: "1rem" }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowCorrection(!showCorrection)}
            style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
          >
            {showCorrection ? "Masquer" : "Voir"} la correction IA
          </button>
          {showCorrection && (
            <div style={{
              background: "var(--bg)",
              border: "1.5px solid var(--border)",
              borderRadius: "12px",
              padding: "1rem",
              marginTop: "0.5rem",
              whiteSpace: "pre-wrap",
              fontSize: "0.9rem"
            }}>
              {session.correction}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoriqueEcriturePage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);

    // Charger les sessions d'écriture seulement
    getSessions(currentUser).then(allSessions => {
      const writingSessions = allSessions.filter(session =>
        session.id.startsWith("writing-")
      );
      setSessions(writingSessions);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="card">
          <h2>Chargement...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="nav-top">
          <button className="back-btn" onClick={() => router.push("/")}>
            &larr;
          </button>
          <div className="chip">Historique d'écriture</div>
          <div style={{ width: 24 }} />
        </div>

        <h2>Mes écrits</h2>

        {sessions.length === 0 ? (
          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
            <p style={{ color: "var(--muted)" }}>
              Aucun texte écrit pour le moment. Commence par une session d'écriture !
            </p>
            <button
              className="btn"
              onClick={() => router.push("/ecrire")}
              style={{ marginTop: "1rem" }}
            >
              Commencer à écrire
            </button>
          </div>
        ) : (
          <div className="sessions-list">
            {sessions
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}