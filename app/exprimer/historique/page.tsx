"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getExpressionSessions } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { expressionMediaList } from "@/data/expression-media";
import { ExpressionMedia } from "@/data/expression-media";

interface ExpressionSessionDisplay {
  id: string;
  date: string;
  mediaTitle: string;
  mediaType: "video" | "image";
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

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
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
        audioUrl: session.audio_url,
        text: session.text,
        correction: session.correction,
        timestamp: session.timestamp,
      };
    });
    setSessions(displaySessions);
    setReady(true);
  };

  if (!ready) return null;

  return (
    <div className="page-wrapper">
      <div className="card">
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/exprimer" style={{ color: "var(--btn)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            ← {t("back")}
          </Link>
        </div>

        <h1 style={{ marginBottom: "0.5rem" }}>📚 {t("expressionSessions")}</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          {sessions.length} expression{sessions.length !== 1 ? "s" : ""}
        </p>

        {/* Sessions list */}
        {sessions.length === 0 ? (
          <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "2rem 1rem", textAlign: "center", marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🎬</p>
            <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.9rem" }}>{t("noExpressionSessions")}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {sessions.map((session) => (
              <div key={session.id} style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                  <div>
                    <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.9rem" }}>
                      {session.mediaType === "video" ? "🎥" : "🖼️"} {session.mediaTitle}
                    </p>
                    <p style={{ color: "var(--muted)", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>{session.date}</p>
                  </div>
                </div>

                {session.audioUrl && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "0 0 0.5rem 0" }}>�️ Ton avis parlé</p>
                    <audio
                      controls
                      preload="metadata"
                      src={session.audioUrl}
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        maxHeight: "40px",
                        backgroundColor: "var(--card)",
                      }}
                    />
                  </div>
                )}

                {session.text && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "0 0 0.5rem 0" }}>✍️ Ton avis écrit</p>
                    <div style={{
                      background: "var(--card)",
                      border: "1.5px solid var(--border)",
                      borderRadius: "8px",
                      padding: "0.75rem",
                      fontSize: "0.85rem",
                      color: "var(--text)",
                      whiteSpace: "pre-wrap",
                      maxHeight: "150px",
                      overflowY: "auto"
                    }}>
                      {session.text}
                    </div>
                  </div>
                )}

                {session.correction && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "#27AE60", margin: "0 0 0.5rem 0", fontWeight: "700" }}>🤖 Correction IA</p>
                    <div style={{
                      background: "#27AE6022",
                      border: "1.5px solid #27AE60",
                      borderRadius: "8px",
                      padding: "0.75rem",
                      fontSize: "0.85rem",
                      color: "var(--text)",
                      whiteSpace: "pre-wrap",
                      maxHeight: "150px",
                      overflowY: "auto"
                    }}>
                      {session.correction}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Back button */}
        <div style={{ height: "1px", background: "var(--border)", margin: "1.5rem 0" }} />
        <Link href="/exprimer" style={{ display: "block", textAlign: "center", color: "var(--btn)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "700" }}>
          ← {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
