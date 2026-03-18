"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessions, getCurrentUser } from "@/lib/storage";
import { Session } from "@/types/session";

function SessionCard({ session, onDelete }: { session: Session; onDelete: (id: string) => void }) {
  const [showCorrection, setShowCorrection] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="session-item">

      {/* Header */}
      <div className="session-meta">
        <span className="session-date">{session.date}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="session-type">✍️ Ecriture</span>
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
            <button
              onClick={() => onDelete(session.id)}
              style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", border: "none", background: "#E74C3C", color: "#fff", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}
            >
              Oui
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", border: "1.5px solid var(--border)", background: "transparent", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}
            >
              Non
            </button>
          </div>
        </div>
      )}

      <div className="session-topic">{session.topic}</div>

      {/* Texte écrit */}
      {session.text && (
        <>
          <p className="audio-label">✍️ Texte écrit</p>
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
                  ✅ Correction IA
                </p>
                <button
                  onClick={() => setShowCorrection(false)}
                  style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "Lato, sans-serif" }}
                >
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

export default function HistoriqueEcriturePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) { router.push("/login"); return; }
    getSessions(currentUser).then((allSessions) => {
      setSessions(allSessions.filter((s) => s.id.startsWith("writing-")).sort((a, b) => b.timestamp - a.timestamp));
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    const { supabase } = await import("@/lib/supabase");
    await supabase.from("sessions").delete().eq("id", id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) return (
    <div className="page-wrapper">
      <div className="card" style={{ textAlign: "center" }}>
        <p>⏳ Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="nav-top">
          <button className="back-btn" onClick={() => router.push("/ecrire")}>&larr;</button>
          <div className="chip">Historique d ecriture</div>
          <div style={{ width: 24 }} />
        </div>

        <h2>Mes écrits</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
          {sessions.length} texte{sessions.length !== 1 ? "s" : ""}
        </p>

        {sessions.length === 0 ? (
          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
            <p style={{ color: "var(--muted)" }}>Aucun texte ecrit pour le moment.</p>
            <button className="btn" onClick={() => router.push("/ecrire")} style={{ marginTop: "1rem" }}>
              Commencer a ecrire
            </button>
          </div>
        ) : (
          <div className="sessions-list">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}