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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
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
            <p>Prochaine seance disponible dans {hoursLeft} heure{hoursLeft > 1 ? "s" : ""}.</p>
            <p>Reviens en forme 💪</p>
          </div>
        ) : (
          <Link href="/intro" className="btn" style={{ textDecoration: "none" }}>
            Commencer
          </Link>
        )}

        <Link href="/dashboard" className="btn btn-ghost" style={{ textDecoration: "none", marginTop: "0.5rem" }}>
          📊 Mes seances
        </Link>
      </div>
    </div>
  );
}