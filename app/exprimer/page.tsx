"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser, getHoursUntilNextSession } from "@/lib/storage";
import { useLang } from "@/lib/i18n";
import { expressionMediaList, getRandomMedia } from "@/data/expression-media";

export default function ExpressionPage() {
  const router = useRouter();
  const { t } = useLang();
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [hoursLeft, setHoursLeft] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [page, setPage] = useState<1 | 2>(1);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setHoursLeft(getHoursUntilNextSession());
    setSelectedMedia(getRandomMedia());
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const handleStartSession = (mode: "speak" | "write") => {
    if (hoursLeft > 0) return;
    router.push(`/exprimer/session?mediaId=${selectedMedia.id}&mode=${mode}`);
  };

  return (
    <div className="page-wrapper">
      <div className="card">

        {/* ---- PAGE 1 : Rules ---- */}
        {page === 1 && (
          <>
            <div className="nav-top">
              <Link href="/" style={{ color: "var(--btn)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                ← {t("back")}
              </Link>
              <div className="chip">1 / 2</div>
              <div style={{ width: 24 }} />
            </div>

            <h2>Règles pour commencer cette session</h2>

            {/* Main Rules */}
            <ul className="tip-list">
              <li>
                <div className="tip-icon">🤲</div>
                <div><strong>BESMILAH</strong> </div>
              </li>
              <li>
                <div className="tip-icon">🎲</div>
                <div>
                  <strong>Sujet aléatoire</strong> — Image ou vidéo 
                </div>
              </li>
              <li>
                <div className="tip-icon">🧠</div>
                <div>
                  <strong>Réfléchis un peu </strong> — Prépare ce que tu veux dire
                </div>
              </li>
              <li>
                <div className="tip-icon">🗣️ </div>
                <div>
                  <strong>Exprime-toi</strong> — Parle ou écris ce que tu penses sans te censurer
                </div>
              </li>
              <li>
                <div className="tip-icon">🤖</div>
                <div>
                  <strong>Correction IA</strong> — Elle vas corriger quelque faute d'expression c'est tout 
                </div>
              </li>
            </ul>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button className="btn btn-ghost" onClick={() => router.push("/")}>
                ← Retour
              </button>
              <button className="btn" onClick={() => setPage(2)}>
                Commence →
              </button>
            </div>
          </>
        )}

        {/* ---- PAGE 2 : Media & Mode Selection ---- */}
        {page === 2 && (
          <>
            <div className="nav-top">
              <button className="back-btn" onClick={() => setPage(1)}>
                &larr;
              </button>
              <div className="chip">2 / 2</div>
              <div style={{ width: 24 }} />
            </div>

            <h1 style={{ marginBottom: "0.5rem" }}>🎬 {t("express")}</h1>
            <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>{t("recordYourOpinion")}</p>

            {/* Locked state */}
            {hoursLeft > 0 && (
              <div style={{ background: "#E74C3C11", border: "1.5px solid #E74C3C44", borderRadius: "12px", padding: "0.85rem 1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🔒</span>
                <div>
                  <p style={{ fontWeight: "700", color: "#E74C3C", margin: 0, fontSize: "0.88rem" }}>{t("locked")}</p>
                  <p style={{ color: "var(--muted)", margin: "0.2rem 0 0", fontSize: "0.8rem" }}>
                    {t("comeBackIn")} {hoursLeft} {hoursLeft > 1 ? t("hours2") : t("hours")}
                  </p>
                </div>
              </div>
            )}

            {/* Media Container */}
            {selectedMedia && (
              <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "16px", padding: "1rem", marginBottom: "1.5rem", overflow: "hidden" }}>
                {selectedMedia.type === "video" ? (
                  <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "12px" }}>
                    <iframe
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                        borderRadius: "12px",
                      }}
                      src={`https://www.youtube.com/embed/${extractYouTubeId(selectedMedia.url)}?rel=0&modestbranding=1`}
                      allowFullScreen
                      title={selectedMedia.title}
                    />
                  </div>
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.title}
                    style={{ width: "100%", borderRadius: "12px", maxHeight: "400px", objectFit: "cover" }}
                  />
                )}
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.75rem", marginBottom: 0 }}>
                  📍 {selectedMedia.title}
                </p>
              </div>
            )}

            {/* Mode Selection */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <button
                onClick={() => handleStartSession("speak")}
                disabled={hoursLeft > 0}
                style={{
                  flex: 1,
                  background: hoursLeft > 0 ? "var(--muted)" : "linear-gradient(135deg, #F98F0B, #FF6B00)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.85rem 1rem",
                  color: hoursLeft > 0 ? "var(--muted-text)" : "#fff",
                  fontWeight: "700",
                  cursor: hoursLeft > 0 ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: hoursLeft > 0 ? "none" : "0 4px 12px rgba(249, 143, 11, 0.3)",
                  transform: hoursLeft > 0 ? "scale(1)" : "scale(1)",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (hoursLeft === 0) {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(249, 143, 11, 0.5)";
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (hoursLeft === 0) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(249, 143, 11, 0.3)";
                  }
                }}
              >
                🎙️ {t("speak")}
              </button>
              <button
                onClick={() => handleStartSession("write")}
                disabled={hoursLeft > 0}
                style={{
                  flex: 1,
                  background: hoursLeft > 0 ? "var(--muted)" : "linear-gradient(135deg, #9B59B6, #8E44AD)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.85rem 1rem",
                  color: hoursLeft > 0 ? "var(--muted-text)" : "#fff",
                  fontWeight: "700",
                  cursor: hoursLeft > 0 ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: hoursLeft > 0 ? "none" : "0 4px 12px rgba(155, 89, 182, 0.3)",
                  transform: hoursLeft > 0 ? "scale(1)" : "scale(1)",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (hoursLeft === 0) {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(155, 89, 182, 0.5)";
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (hoursLeft === 0) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(155, 89, 182, 0.3)";
                  }
                }}
              >
                ✍️ {t("write")}
              </button>
            </div>

            {/* History Button */}
            <button
              onClick={() => router.push("/exprimer/historique")}
              style={{
                width: "100%",
                background: "var(--card)",
                border: "1.5px solid var(--border)",
                borderRadius: "12px",
                padding: "0.85rem 1rem",
                color: "var(--text)",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              📚 {t("myExpressions")}
            </button>
          </>
        )}

      </div>
    </div>
  );
}

function extractYouTubeId(url: string): string {
  const shortUrl = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return shortUrl ? shortUrl[1] : "";
}
