"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getHoursUntilNextSession, logoutUser } from "@/lib/storage";

export default function AccueilPage() {
  const router = useRouter();
  const [hoursLeft, setHoursLeft] = useState(0);
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setHoursLeft(getHoursUntilNextSession());
    setReady(true);
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
        <p>Pret a ameliorer ton expression orale aujourd hui ?</p>

        {hoursLeft > 0 ? (
          <div className="blocked-box">
            <div className="big">{hoursLeft}h</div>
            <p>
              Prochaine seance disponible dans {hoursLeft} heure
              {hoursLeft > 1 ? "s" : ""}.
            </p>
            <p>Reviens en forme 💪</p>
          </div>
        ) : (
          <Link href="/intro" className="btn" style={{ textDecoration: "none" }}>
            Commencer
          </Link>
        )}

        <Link
          href="/dashboard"
          className="btn btn-ghost"
          style={{ textDecoration: "none", marginTop: "0.5rem" }}
        >
          📊 Mes seances
        </Link>

        {/* ---- Separateur ---- */}
        <div style={{
          height: "1px",
          background: "var(--border)",
          margin: "1.5rem 0",
        }} />

        {/* ---- Nouvelle feature IA ---- */}
        <div style={{
          background: "linear-gradient(135deg, #F98F0B22, #F98F0B11)",
          border: "1.5px solid var(--btn)",
          borderRadius: "16px",
          padding: "1rem",
          marginBottom: "0.75rem",
          cursor: "pointer",
        }}
          onClick={() => setExpandedFeature(expandedFeature === "ia" ? null : "ia")}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🤖</span>
              <div>
                <p style={{
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--btn)",
                  margin: 0,
                  marginBottom: "0.1rem",
                }}>
                  Nouvelle feature
                </p>
                <p style={{
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "var(--text)",
                  margin: 0,
                }}>
                  Correction IA de ta prise de parole
                </p>
              </div>
            </div>
            <span style={{
              color: "var(--btn)",
              fontSize: "1.2rem",
              fontWeight: "700",
              transition: "transform 0.2s",
              transform: expandedFeature === "ia" ? "rotate(180deg)" : "rotate(0deg)",
              display: "inline-block",
            }}>
              ▼
            </span>
          </div>

          {expandedFeature === "ia" && (
            <div style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid #F98F0B33",
              animation: "fadeUp 0.3s ease",
            }}>
              <p style={{
                fontSize: "0.85rem",
                color: "var(--text)",
                lineHeight: "1.7",
                marginBottom: "0.75rem",
              }}>
                Apres chaque seance, notre IA analyse automatiquement ce que tu as dit et te propose une version corrigee de ton texte.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { icon: "🎙️", text: "Ton audio est transcrit en texte automatiquement" },
                  { icon: "📝", text: "Tu vois exactement ce que tu as dit" },
                  { icon: "✅", text: "Clique sur Voir la correction pour voir ton texte corrige sans fautes" },
                  { icon: "📈", text: "Progresse seance apres seance en comparant les deux versions" },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    background: "var(--bg)",
                    borderRadius: "10px",
                    padding: "0.5rem 0.75rem",
                  }}>
                    <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                    <p style={{
                      fontSize: "0.82rem",
                      color: "var(--text)",
                      lineHeight: "1.5",
                      margin: 0,
                    }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---- Stay tuned ---- */}
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
              fontSize: "0.7rem",
              fontWeight: "700",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#27AE60",
              margin: 0,
              marginBottom: "0.2rem",
            }}>
              Coming soon
            </p>
            <p style={{
              fontSize: "0.85rem",
              color: "var(--text)",
              margin: 0,
              lineHeight: "1.5",
            }}>
              D autres features arrivent bientot. Stay tuned 👀
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}