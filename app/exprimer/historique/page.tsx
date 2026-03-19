"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getExpressionSessions } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { expressionMediaList, ExpressionMedia } from "@/data/expression-media";
import { supabase } from "@/lib/supabase";

interface ExpressionSessionDisplay {
  id: string;
  date: string;
  mediaTitle: string;
  mediaType: "video" | "image";
  mediaUrl: string;
  audioUrl: string | null;
  text: string | null;
  correction: string | null;
  timestamp: number;
}

export default function ExpressionHistoryPage() {
  const router = useRouter();
  const { t } = useLang();
  const [user, setUser] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ExpressionSessionDisplay[]>([]);
  const [ready, setReady] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [showResetInput, setShowResetInput] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) { router.push("/login"); return; }
    setUser(currentUser);
    loadSessions(currentUser);
  }, [router]);

  const loadSessions = async (userNickname: string) => {
    const dbSessions = await getExpressionSessions(userNickname);
    const displaySessions: ExpressionSessionDisplay[] = dbSessions.map((session) => {
      const media = expressionMediaList.find((m: ExpressionMedia) => m.id === session.media_id);
      return {
        id: session.id,
        date: session.date,
        mediaTitle: media?.title || "Média supprimé",
        mediaType: session.media_type,
        mediaUrl: session.media_url,
        audioUrl: session.audio_url,
        text: session.text,
        correction: session.correction,
        timestamp: session.timestamp,
      };
    });
    setSessions(displaySessions);
    setReady(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("expression_sessions")
      .delete()
      .eq("id", id);
    if (!error) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleResetTimer = () => {
    if (resetCode === "1644") {
      localStorage.removeItem("lastExpression");
      setResetMsg("✅ Timer réinitialisé !");
      setResetCode("");
      setTimeout(() => setResetMsg(null), 3000);
    } else {
      setResetMsg("❌ Code incorrect");
      setTimeout(() => setResetMsg(null), 2000);
    }
  };

  if (!ready) return null;

  return (
    <div className="page-wrapper">
      <div className="card">
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/exprimer" style={{ color: "var(--btn)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            ← {t("back")}
          </Link>
        </div>

        <h1 style={{ marginBottom: "0.5rem" }}>📚 Mes Expressions</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          {sessions.length} expression{sessions.length !== 1 ? "s" : ""}
        </p>

        {sessions.length === 0 ? (
          <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "2rem 1rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🎬</p>
            <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.9rem" }}>Aucune expression pour l instant.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Reset timer */}
        <div style={{ height: "1px", background: "var(--border)", margin: "1.5rem 0" }} />

        <div style={{ marginBottom: "1rem" }}>
          <button
            onClick={() => setShowResetInput(!showResetInput)}
            style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "Lato, sans-serif", width: "100%", textAlign: "center" }}
          >
            🔒 {showResetInput ? "Masquer" : "Réinitialiser le timer"}
          </button>

          {showResetInput && (
            <div style={{ marginTop: "0.75rem", background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0 0 0.75rem 0", textAlign: "center" }}>
                Entre le code pour débloquer une nouvelle séance
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="password"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetTimer()}
                  placeholder="Code..."
                  maxLength={4}
                  style={{
                    flex: 1,
                    padding: "0.6rem 0.75rem",
                    borderRadius: "8px",
                    border: "1.5px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--text)",
                    fontFamily: "Lato, sans-serif",
                    fontSize: "1rem",
                    outline: "none",
                    textAlign: "center",
                    letterSpacing: "0.3em",
                  }}
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

        <Link href="/exprimer" style={{ display: "block", textAlign: "center", color: "var(--btn)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "700" }}>
          ← Retour
        </Link>
      </div>
    </div>
  );
}

function SessionCard({ session, onDelete }: { session: ExpressionSessionDisplay; onDelete: (id: string) => void }) {
  const [showCorrection, setShowCorrection] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.9rem" }}>
            {session.mediaType === "video" ? "🎥" : "🖼️"} {session.mediaTitle}
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>{session.date}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.72rem", background: session.audioUrl ? "#F98F0B22" : "#27AE6022", color: session.audioUrl ? "#F98F0B" : "#27AE60", border: `1px solid ${session.audioUrl ? "#F98F0B" : "#27AE60"}`, borderRadius: "20px", padding: "0.2rem 0.6rem", fontWeight: "700" }}>
            {session.audioUrl ? "🎙️ Oral" : "✍️ Ecrit"}
          </span>
          {/* Bouton suppression */}
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", padding: "0.2rem", color: "#E74C3C", opacity: 0.7 }}
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div style={{ background: "#E74C3C11", border: "1.5px solid #E74C3C", borderRadius: "10px", padding: "0.75rem", marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: "0.82rem", color: "#E74C3C", margin: 0, fontWeight: "700" }}>
            Supprimer cette session ?
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

      {/* Bouton média */}
      <button
        onClick={() => setShowMedia(!showMedia)}
        style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1.5px solid var(--border)", background: "transparent", color: "var(--muted)", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
      >
        {showMedia
          ? `${session.mediaType === "video" ? "🎥" : "🖼️"} Masquer le média ▲`
          : `${session.mediaType === "video" ? "🎥" : "🖼️"} Voir le média ▼`}
      </button>

      {/* Média */}
      {showMedia && (
        <div style={{ marginBottom: "0.75rem", borderRadius: "12px", overflow: "hidden" }}>
          {session.mediaType === "video" ? (
            <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", borderRadius: "12px" }}
                src={`https://www.youtube.com/embed/${extractYouTubeId(session.mediaUrl || "")}?rel=0&modestbranding=1`}
                allowFullScreen
                title={session.mediaTitle}
              />
            </div>
          ) : (
            <img src={session.mediaUrl} alt={session.mediaTitle} style={{ width: "100%", borderRadius: "12px", maxHeight: "200px", objectFit: "cover" }} />
          )}
        </div>
      )}

      {/* Audio */}
      {session.audioUrl && (
        <div style={{ marginBottom: "0.75rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "0 0 0.4rem 0" }}>🎧 Ton avis parlé</p>
          <audio controls preload="metadata" src={session.audioUrl} style={{ width: "100%", borderRadius: "8px" }} />
        </div>
      )}

      {/* Correction IA */}
      {session.correction && (
        <div style={{ marginTop: "0.5rem" }}>
          {!showCorrection ? (
            <button
              onClick={() => setShowCorrection(true)}
              style={{ width: "100%", padding: "0.6rem", borderRadius: "10px", border: "1.5px solid #27AE60", background: "transparent", color: "#27AE60", fontFamily: "Lato, sans-serif", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer" }}
            >
              🤖 Voir la correction IA
            </button>
          ) : (
            <div style={{ background: "#27AE6011", border: "1.5px solid #27AE60", borderRadius: "10px", padding: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "#27AE60", margin: 0 }}>🤖 Correction IA</p>
                <button onClick={() => setShowCorrection(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "Lato, sans-serif" }}>
                  Masquer ✕
                </button>
              </div>
              <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "8px", padding: "0.75rem", fontSize: "0.85rem", color: "var(--text)", whiteSpace: "pre-wrap", lineHeight: "1.6", maxHeight: "200px", overflowY: "auto" }}>
                {session.correction}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : "";
}