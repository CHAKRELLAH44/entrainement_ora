"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  getHoursUntilNextSession,
  logoutUser,
  getSessions,
  calculateStreak,
} from "@/lib/storage";

export default function AccueilPage() {
  const router = useRouter();
  const [hoursLeft, setHoursLeft] = useState(0);
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setHoursLeft(getHoursUntilNextSession());
    getSessions(currentUser).then((data) => {
      setStreak(calculateStreak(data));
      setReady(true);
    });
  }, []);

  function handleLogout() {
    logoutUser();
    router.push("/login");
  }

  if (!ready) return null;

  return (
    <div className="page-wrapper">
      <div className="card">

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}>
          <div className="logo" style={{ margin: 0 }}>Parole Libre</div>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.8rem",
              color: "var(--muted)",
              fontFamily: "Lato, sans-serif",
            }}
          >
            Deconnexion
          </button>
        </div>

        <h1>Bonjour {user} 👋</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
          Que veux-tu faire aujourd hui ?
        </p>

        {/* Choix Parler ou Lire */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", margin: "0.5rem 0 1rem" }}>

          {/* ---- Parler ---- */}
          <div
            onClick={() => hoursLeft === 0 && router.push("/intro")}
            style={{
              background: hoursLeft > 0
                ? "var(--bg)"
                : "linear-gradient(135deg, #F98F0B22, #F98F0B11)",
              border: hoursLeft > 0
                ? "1.5px solid var(--border)"
                : "1.5px solid var(--btn)",
              borderRadius: "16px",
              padding: "1.25rem 1rem",
              textAlign: "center",
              cursor: hoursLeft > 0 ? "not-allowed" : "pointer",
              opacity: hoursLeft > 0 ? 0.5 : 1,
              transition: "all 0.2s",
              position: "relative",
            }}
          >
            {/* Badge streak */}
            <div style={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              background: "linear-gradient(135deg, #FF6B00, #F98F0B)",
              borderRadius: "20px",
              padding: "0.2rem 0.55rem",
              fontSize: "0.72rem",
              fontWeight: "700",
              color: "#fff",
              boxShadow: "0 2px 8px #F98F0B55",
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
            }}>
              🔥 {streak}j
            </div>

            <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>🎙️</div>
            <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.95rem" }}>
              Parler
            </p>
            {hoursLeft > 0 ? (
              <p style={{ fontSize: "0.7rem", color: "#E74C3C", margin: "0.4rem 0 0", fontWeight: "700" }}>
                🔒 {hoursLeft}h restantes
              </p>
            ) : (
              <p style={{ fontSize: "0.7rem", color: "var(--btn)", margin: "0.4rem 0 0" }}>
                Disponible ✓
              </p>
            )}
          </div>

          {/* ---- Lire ---- */}
          <div
            onClick={() => router.push("/lecture")}
            style={{
              background: "linear-gradient(135deg, #27AE6022, #27AE6011)",
              border: "1.5px solid #27AE60",
              borderRadius: "16px",
              padding: "1.25rem 1rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              position: "relative",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>📚</div>
            <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.95rem" }}>
              Lire
            </p>
            <p style={{ fontSize: "0.7rem", color: "#27AE60", margin: "0.4rem 0 0" }}>
              Toujours disponible ✓
            </p>
          </div>

        </div>

        {/* Message blocage 24h */}
        {hoursLeft > 0 && (
          <div style={{
            background: "#E74C3C11",
            border: "1.5px solid #E74C3C44",
            borderRadius: "12px",
            padding: "0.85rem 1rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <span style={{ fontSize: "1.5rem" }}>⏳</span>
            <div>
              <p style={{ fontWeight: "700", color: "#E74C3C", margin: 0, fontSize: "0.88rem" }}>
                Partie orale indisponible
              </p>
              <p style={{ color: "var(--muted)", margin: "0.2rem 0 0", fontSize: "0.8rem" }}>
                Reviens dans {hoursLeft} heure{hoursLeft > 1 ? "s" : ""}. Tu peux lire en attendant !
              </p>
            </div>
          </div>
        )}

        <Link
          href="/dashboard"
          className="btn btn-ghost"
          style={{ textDecoration: "none" }}
        >
          📊 Mes seances
        </Link>

        {/* Separateur */}
        <div style={{ height: "1px", background: "var(--border)", margin: "1.5rem 0" }} />

        {/* Nouvelle feature */}
        <div
          style={{
            background: "linear-gradient(135deg, #F98F0B22, #F98F0B11)",
            border: "1.5px solid var(--btn)",
            borderRadius: "16px",
            padding: "1rem",
            marginBottom: "0.75rem",
            cursor: "pointer",
          }}
          onClick={() => setExpandedFeature(expandedFeature === "update" ? null : "update")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>📚</span>
              <div>
                <p style={{
                  fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "var(--btn)", margin: 0, marginBottom: "0.1rem",
                }}>
                  Nouvelle feature
                </p>
                <p style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text)", margin: 0 }}>
                  Module de lecture
                </p>
              </div>
            </div>
            <span style={{
              color: "var(--btn)", fontSize: "1.2rem", fontWeight: "700",
              transition: "transform 0.2s",
              transform: expandedFeature === "update" ? "rotate(180deg)" : "rotate(0deg)",
              display: "inline-block",
            }}>
              ▼
            </span>
          </div>

          {expandedFeature === "update" && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #F98F0B33" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: "1.7", marginBottom: "0.75rem" }}>
                Un nouveau module de lecture est maintenant disponible ! Lis des livres, suis ta progression et progresse en francais.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { icon: "📖", text: "Choisis un livre dans la bibliotheque et lis chapitre par chapitre" },
                  { icon: "🔖", text: "Ta progression est sauvegardee — reprends la ou tu t es arrete" },
                  { icon: "✍️", text: "Apres chaque livre ecris un resume de min. 100 mots" },
                  { icon: "📚", text: "Note 2 nouveaux mots appris avec leurs definitions" },
                  { icon: "🤖", text: "L IA corrige ton resume et verifie si tes definitions sont correctes" },
                  { icon: "🔒", text: "Termine un livre et son bilan pour debloquer le suivant" },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: "0.5rem",
                    background: "var(--bg)", borderRadius: "10px", padding: "0.5rem 0.75rem",
                  }}>
                    <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                    <p style={{ fontSize: "0.82rem", color: "var(--text)", lineHeight: "1.5", margin: 0 }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stay tuned */}
        <div style={{
          background: "linear-gradient(135deg, #27AE6022, #27AE6011)",
          border: "1.5px solid #27AE60",
          borderRadius: "16px",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <span style={{ fontSize: "1.2rem" }}>🚀</span>
          <div>
            <p style={{
              fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#27AE60", margin: 0, marginBottom: "0.2rem",
            }}>
              Coming soon
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--text)", margin: 0, lineHeight: "1.5" }}>
              D autres features arrivent bientot. Stay tuned 👀
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}