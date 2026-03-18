"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser, getHoursUntilNextSession, logoutUser, getSessions, calculateStreak, testSupabaseConnection } from "@/lib/storage";
import { useLang, setUserLang, getLangFlag, getLangLabel, Lang } from "@/lib/i18n";

const LANGS: Lang[] = ["fr", "en", "es"];

export default function AccueilPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const [hoursLeft, setHoursLeft] = useState(0);
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) { router.push("/login"); return; }
    setUser(currentUser);
    setHoursLeft(getHoursUntilNextSession());

    // Test de connexion Supabase
    testSupabaseConnection();

    getSessions(currentUser).then((data) => {
      setStreak(calculateStreak(data));
      setReady(true);
    });
  }, []);

  // Fermer le menu historique quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showHistoryMenu && !(event.target as Element).closest('.history-menu-container')) {
        setShowHistoryMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHistoryMenu]);

  function handleLogout() {
    logoutUser();
    router.push("/login");
  }

  if (!ready) return null;

  return (
    <div className="page-wrapper">
      <div className="card">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <Image src="/favo.svg" alt="Logo" width={40} height={40} style={{ margin: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>

            {/* Lang switcher */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowLangPicker(!showLangPicker)}
                style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "20px", padding: "0.3rem 0.65rem", cursor: "pointer", fontSize: "0.85rem", color: "var(--text)", fontFamily: "Lato, sans-serif", display: "flex", alignItems: "center", gap: "0.3rem" }}
              >
                {getLangFlag(lang)} {lang.toUpperCase()} ▾
              </button>

              {showLangPicker && (
                <div style={{ position: "absolute", top: "110%", right: 0, background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "0.4rem", zIndex: 100, boxShadow: "0 8px 24px #00000055", minWidth: "150px" }}>
                  {LANGS.map((l) => (
                    <div
                      key={l}
                      onClick={() => { setUserLang(l); setShowLangPicker(false); }}
                      style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", background: lang === l ? "var(--btn)" : "transparent", color: lang === l ? "#fff" : "var(--text)", fontSize: "0.85rem", fontWeight: lang === l ? "700" : "normal" }}
                    >
                      {getLangFlag(l)} {getLangLabel(l)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "var(--muted)", fontFamily: "Lato, sans-serif" }}>
              {t("logout")}
            </button>
          </div>
        </div>

        <h1>{t("hello")} {user} 👋</h1>

        {/* Streak */}
        {streak > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg, #FF6B0022, #F98F0B22)", border: "1.5px solid #F98F0B", borderRadius: "12px", padding: "0.6rem 1rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.4rem" }}>🔥</span>
            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "700", color: "var(--text)" }}>
              {streak} {streak > 1 ? t("streakDays2") : t("streakDays")} {t("streakSuffix")}
            </p>
          </div>
        )}

        <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>{t("whatToDo")}</p>

        {/* Parler / Lire / Écrire / Exprimer */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", margin: "0.5rem 0 1rem" }}>
          <div
            onClick={() => hoursLeft === 0 && router.push("/intro")}
            style={{ background: hoursLeft > 0 ? "var(--bg)" : "linear-gradient(135deg, #F98F0B22, #F98F0B11)", border: hoursLeft > 0 ? "1.5px solid var(--border)" : "1.5px solid var(--btn)", borderRadius: "16px", padding: "1.25rem 1rem", textAlign: "center", cursor: hoursLeft > 0 ? "not-allowed" : "pointer", opacity: hoursLeft > 0 ? 0.5 : 1, transition: "all 0.2s", position: "relative" }}
          >
            <div style={{ position: "absolute", top: "-10px", right: "-10px", background: "linear-gradient(135deg, #FF6B00, #F98F0B)", borderRadius: "20px", padding: "0.2rem 0.55rem", fontSize: "0.72rem", fontWeight: "700", color: "#fff", boxShadow: "0 2px 8px #F98F0B55" }}>
              🔥 {streak}j
            </div>
            <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>🎙️</div>
            <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.95rem" }}>{t("speak")}</p>
            {hoursLeft > 0 ? (
              <p style={{ fontSize: "0.7rem", color: "#E74C3C", margin: "0.4rem 0 0", fontWeight: "700" }}>🔒 {hoursLeft}{t("lockedHours")}</p>
            ) : (
              <p style={{ fontSize: "0.7rem", color: "var(--btn)", margin: "0.4rem 0 0" }}>{t("available")} ✓</p>
            )}
          </div>

          <div
            onClick={() => router.push("/lecture")}
            style={{ background: "linear-gradient(135deg, #27AE6022, #27AE6011)", border: "1.5px solid #27AE60", borderRadius: "16px", padding: "1.25rem 1rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>📚</div>
            <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.95rem" }}>{t("read")}</p>
            <p style={{ fontSize: "0.7rem", color: "#27AE60", margin: "0.4rem 0 0" }}>{t("alwaysAvailable")} ✓</p>
          </div>

          <div
            onClick={() => router.push("/ecrire")}
            style={{ background: "linear-gradient(135deg, #9B59B622, #9B59B611)", border: "1.5px solid #9B59B6", borderRadius: "16px", padding: "1.25rem 1rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
          >
            
            <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>✍️</div>
            <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.95rem" }}>{t("write")}</p>
            <p style={{ fontSize: "0.7rem", color: "#9B59B6", margin: "0.4rem 0 0" }}>{t("alwaysAvailable")} ✓</p>
            
          </div>

          <div
  onClick={() => hoursLeft === 0 && router.push("/exprimer")}
  style={{ background: hoursLeft > 0 ? "var(--bg)" : "linear-gradient(135deg, #E67E2222, #E67E2211)", border: hoursLeft > 0 ? "1.5px solid var(--border)" : "1.5px solid #E67E22", borderRadius: "16px", padding: "1.25rem 1rem", textAlign: "center", cursor: hoursLeft > 0 ? "not-allowed" : "pointer", opacity: hoursLeft > 0 ? 0.5 : 1, transition: "all 0.2s", position: "relative" }}
>
  {/* Badge NEW */}
  <div style={{ position: "absolute", top: "-10px", left: "-10px", background: "linear-gradient(135deg, #2e2c9b, #00fff2)", borderRadius: "20px", padding: "0.2rem 0.55rem", fontSize: "0.65rem", fontWeight: "700", color: "#fff", boxShadow: "0 2px 8px #E67E2255", letterSpacing: "0.05em" }}>
    ✨ NEW
  </div>
  <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>🎬</div>
  <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.95rem" }}>{t("express")}</p>
  {hoursLeft > 0 ? (
    <p style={{ fontSize: "0.7rem", color: "#E74C3C", margin: "0.4rem 0 0", fontWeight: "700" }}>🔒 {hoursLeft}{t("lockedHours")}</p>
  ) : (
    <p style={{ fontSize: "0.7rem", color: "#E67E22", margin: "0.4rem 0 0" }}>{t("available")} ✓</p>
  )}
</div>
        </div>

        {/* Bouton Historique unique */}
        <div className="history-menu-container" style={{ position: "relative", marginBottom: "1rem" }}>
          <button
            onClick={() => setShowHistoryMenu(!showHistoryMenu)}
            className="btn"
            style={{ width: "100%", position: "relative" }}
          >
            📚 {t("myActivities")}
            <span style={{ marginLeft: "0.5rem", transform: showHistoryMenu ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.2s" }}>▼</span>
          </button>

          {showHistoryMenu && (
            <div style={{ position: "absolute", top: "110%", left: 0, right: 0, background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "0.5rem", zIndex: 100, boxShadow: "0 8px 24px #00000055" }}>
              <button
                onClick={() => { router.push("/dashboard"); setShowHistoryMenu(false); }}
                className="btn btn-ghost"
                style={{ width: "100%", marginBottom: "0.25rem", justifyContent: "flex-start", padding: "0.75rem 1rem" }}
              >
                🎙️ {t("mySpeakingSessions")}
              </button>
              <button
                onClick={() => { router.push("/lecture/historique"); setShowHistoryMenu(false); }}
                className="btn btn-ghost"
                style={{ width: "100%", marginBottom: "0.25rem", justifyContent: "flex-start", padding: "0.75rem 1rem" }}
              >
                📖 {t("myReadings")}
              </button>
              <button
                onClick={() => { router.push("/ecrire/historique"); setShowHistoryMenu(false); }}
                className="btn btn-ghost"
                style={{ width: "100%", marginBottom: "0.25rem", justifyContent: "flex-start", padding: "0.75rem 1rem" }}
              >
                ✍️ {t("myWritings")}
              </button>
              <button
                onClick={() => { router.push("/exprimer/historique"); setShowHistoryMenu(false); }}
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "flex-start", padding: "0.75rem 1rem" }}
              >
                🎬 {t("expressionSessions")}
              </button>
            </div>
          )}
        </div>

        {hoursLeft > 0 && (
          <div style={{ background: "#E74C3C11", border: "1.5px solid #E74C3C44", borderRadius: "12px", padding: "0.85rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.5rem" }}>⏳</span>
            <div>
              <p style={{ fontWeight: "700", color: "#E74C3C", margin: 0, fontSize: "0.88rem" }}>{t("oralUnavailable")}</p>
              <p style={{ color: "var(--muted)", margin: "0.2rem 0 0", fontSize: "0.8rem" }}>
                {t("comeBackIn")} {hoursLeft} {hoursLeft > 1 ? t("hours2") : t("hours")}. {t("canRead")}
              </p>
            </div>
          </div>
        )}

        <div style={{ height: "1px", background: "var(--border)", margin: "1.5rem 0" }} />

        {/* Feature - Expression */}
        <div
          style={{ background: "linear-gradient(135deg, #E67E2222, #E67E2211)", border: "1.5px solid #E67E22", borderRadius: "16px", padding: "1rem", marginBottom: "0.75rem", cursor: "pointer" }}
          onClick={() => setExpandedFeature(expandedFeature === "update" ? null : "update")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>🎬</span>
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#E67E22", margin: 0 }}>{t("newFeature")}</p>
                <p style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text)", margin: 0 }}>{t("expressionModule")}</p>
              </div>
            </div>
            <span style={{ color: "#E67E22", fontSize: "1.2rem", fontWeight: "700", transform: expandedFeature === "update" ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.2s" }}>▼</span>
          </div>
          {expandedFeature === "update" && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #E67E2233" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { icon: "🎥", text: "Vidéos et photos aléatoires" },
                  { icon: "⏰", text: "Pas de limite de temps" },
                  { icon: "🎙️", text: "Enregistre ton avis en parole" },
                  { icon: "📚", text: "Historique de tes expressions" },
                  { icon: "🔄", text: "Pratique l'expression spontanée" },
                  { icon: "🚀", text: "Disponible après 24h comme Parler" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", background: "var(--bg)", borderRadius: "10px", padding: "0.5rem 0.75rem" }}>
                    <span>{item.icon}</span>
                    <p style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: "1.5", margin: 0 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ background: "linear-gradient(135deg, #27AE6022, #27AE6011)", border: "1.5px solid #27AE60", borderRadius: "16px", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.2rem" }}>🚀</span>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#27AE60", margin: 0, marginBottom: "0.2rem" }}>Coming soon</p>
            <p style={{ fontSize: "0.85rem", color: "var(--text)", margin: 0 }}>{t("comingSoon")} 👀</p>
          </div>
        </div>

      </div>
    </div>
  );
}