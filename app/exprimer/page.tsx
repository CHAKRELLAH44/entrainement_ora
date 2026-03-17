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
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/" style={{ color: "var(--btn)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            ← {t("back")}
          </Link>
        </div>

        <h1 style={{ marginBottom: "0.5rem" }}>🎬 {t("express")}</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>{t("watchAndComment")}</p>

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

        {/* Instructions */}
        <div style={{ background: "linear-gradient(135deg, #E67E2222, #E67E2211)", border: "1.5px solid #E67E22", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
          <p style={{ fontWeight: "700", color: "var(--text)", margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>💬 {t("recordYourOpinion")}</p>
          <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "var(--muted)", fontSize: "0.85rem", lineHeight: "1.6" }}>
            <li>Exprime-toi librement sur ce que tu vois</li>
            <li>Choisis entre parler ou écrire</li>
            <li>Correction automatique avec IA</li>
            <li>Sauvegardé dans ton historique</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
          <button
            onClick={() => handleStartSession("speak")}
            disabled={hoursLeft > 0}
            style={{
              background: hoursLeft > 0 ? "var(--bg)" : "linear-gradient(135deg, #F98F0B, #FF6B00)",
              border: "none",
              borderRadius: "12px",
              padding: "0.85rem 1rem",
              color: hoursLeft > 0 ? "var(--muted)" : "#fff",
              fontWeight: "700",
              cursor: hoursLeft > 0 ? "not-allowed" : "pointer",
              opacity: hoursLeft > 0 ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            🎙️ {t("speak")}
          </button>
          <button
            onClick={() => handleStartSession("write")}
            disabled={hoursLeft > 0}
            style={{
              background: hoursLeft > 0 ? "var(--bg)" : "linear-gradient(135deg, #9B59B6, #8E44AD)",
              border: "none",
              borderRadius: "12px",
              padding: "0.85rem 1rem",
              color: hoursLeft > 0 ? "var(--muted)" : "#fff",
              fontWeight: "700",
              cursor: hoursLeft > 0 ? "not-allowed" : "pointer",
              opacity: hoursLeft > 0 ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            ✍️ {t("write")}
          </button>
        </div>

        <div style={{ height: "1px", background: "var(--border)", margin: "1.5rem 0" }} />

        {/* History button */}
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
      </div>
    </div>
  );
}

function extractYouTubeId(url: string): string {
  const shortUrl = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return shortUrl ? shortUrl[1] : "";
}
