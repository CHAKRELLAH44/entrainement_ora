"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserStats {
  nickname: string;
  totalSessions: number;
  lastActivity: string | null;
  lastActivityTimestamp: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  const ADMIN_PASSWORD = "1234"; // Changez ce mot de passe pour sécuriser l'accès

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      loadData();
    } else {
      setError("❌ Mot de passe incorrect");
      setTimeout(() => setError(""), 2000);
    }
  }

  async function loadData() {
    setLoading(true);

    // Charger tous les users
    const { data: usersData } = await supabase
      .from("allowed_users")
      .select("nickname")
      .order("nickname");

    if (!usersData) { setLoading(false); return; }

    // Pour chaque user, compter les sessions et derniere activite
    const stats: UserStats[] = await Promise.all(
      usersData.map(async (u) => {
        const { data: sessions } = await supabase
          .from("sessions")
          .select("timestamp, date")
          .eq("user_nickname", u.nickname)
          .order("timestamp", { ascending: false });

        const { data: exprSessions } = await supabase
          .from("expression_sessions")
          .select("timestamp, date")
          .eq("user_nickname", u.nickname)
          .order("timestamp", { ascending: false });

        const allSessions = [
          ...(sessions || []),
          ...(exprSessions || []),
        ].sort((a, b) => b.timestamp - a.timestamp);

        const lastTimestamp = allSessions[0]?.timestamp || 0;
        const lastDate = allSessions[0]?.date || null;

        return {
          nickname: u.nickname,
          totalSessions: allSessions.length,
          lastActivity: lastDate,
          lastActivityTimestamp: lastTimestamp,
        };
      })
    );

    // Trier par derniere activite
    stats.sort((a, b) => b.lastActivityTimestamp - a.lastActivityTimestamp);
    setUsers(stats);
    setLoading(false);
  }

  async function handleDeleteUser(nickname: string) {
    // Supprimer toutes les sessions
    await supabase.from("sessions").delete().eq("user_nickname", nickname);
    await supabase.from("expression_sessions").delete().eq("user_nickname", nickname);
    await supabase.from("reading_progress").delete().eq("user_nickname", nickname);
    await supabase.from("reading_reviews").delete().eq("user_nickname", nickname);
    // Supprimer le user
    await supabase.from("allowed_users").delete().eq("nickname", nickname);

    setUsers((prev) => prev.filter((u) => u.nickname !== nickname));
    setConfirmDelete(null);
    setDeleteMsg(`✅ ${nickname} supprimé`);
    setTimeout(() => setDeleteMsg(null), 3000);
  }

  // ── Page login ────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔐</div>
          <h2 style={{ marginBottom: "0.25rem" }}>Admin</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            Accès réservé
          </p>
          <input
            type="password"
            placeholder="Mot de passe..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "0.9rem 1rem", borderRadius: "12px", border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "1rem", outline: "none", marginBottom: "0.75rem", boxSizing: "border-box", textAlign: "center", letterSpacing: "0.2em" }}
          />
          {error && (
            <p style={{ color: "#E74C3C", fontSize: "0.85rem", marginBottom: "0.75rem", fontWeight: "700" }}>
              {error}
            </p>
          )}
          <button
            onClick={handleLogin}
            disabled={!password}
            style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", border: "none", background: "var(--btn)", color: "#fff", fontFamily: "Lato, sans-serif", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer", opacity: password ? 1 : 0.5 }}
          >
            Entrer
          </button>
        </div>
      </div>
    );
  }

  // ── Page admin ────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <div className="card">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ margin: 0 }}>🔐 Admin</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>
              {users.length} utilisateur{users.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={loadData}
            style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "10px", padding: "0.5rem 0.75rem", cursor: "pointer", fontSize: "0.82rem", color: "var(--text)", fontFamily: "Lato, sans-serif", fontWeight: "700" }}
          >
            🔄 Rafraichir
          </button>
        </div>

        {/* Message suppression */}
        {deleteMsg && (
          <div style={{ background: "#27AE6022", border: "1.5px solid #27AE60", borderRadius: "10px", padding: "0.75rem", marginBottom: "1rem", textAlign: "center" }}>
            <p style={{ color: "#27AE60", margin: 0, fontWeight: "700", fontSize: "0.85rem" }}>{deleteMsg}</p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "var(--muted)" }}>⏳ Chargement...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "var(--muted)" }}>Aucun utilisateur</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {users.map((user) => (
              <div key={user.nickname} style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>

                {/* Header user */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #F98F0B, #FF6B00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "700", color: "#fff" }}>
                      {user.nickname[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.95rem" }}>
                        {user.nickname}
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: "0.1rem 0 0" }}>
                        Dernière activité : {user.lastActivity || "Aucune"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmDelete(user.nickname)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#E74C3C", opacity: 0.8 }}
                  >
                    🗑️
                  </button>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.72rem", background: "#F98F0B22", color: "var(--btn)", border: "1px solid var(--btn)", borderRadius: "20px", padding: "0.2rem 0.6rem", fontWeight: "700" }}>
                    🎯 {user.totalSessions} session{user.totalSessions !== 1 ? "s" : ""}
                  </span>
                  {user.lastActivityTimestamp > 0 && (
                    <span style={{ fontSize: "0.72rem", background: "#27AE6022", color: "#27AE60", border: "1px solid #27AE60", borderRadius: "20px", padding: "0.2rem 0.6rem", fontWeight: "700" }}>
                      ✅ Actif
                    </span>
                  )}
                  {user.totalSessions === 0 && (
                    <span style={{ fontSize: "0.72rem", background: "#E74C3C22", color: "#E74C3C", border: "1px solid #E74C3C", borderRadius: "20px", padding: "0.2rem 0.6rem", fontWeight: "700" }}>
                      😴 Inactif
                    </span>
                  )}
                </div>

                {/* Confirmation suppression */}
                {confirmDelete === user.nickname && (
                  <div style={{ background: "#E74C3C11", border: "1.5px solid #E74C3C", borderRadius: "10px", padding: "0.75rem", marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: "0.82rem", color: "#E74C3C", margin: 0, fontWeight: "700" }}>
                      Supprimer {user.nickname} ?
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleDeleteUser(user.nickname)}
                        style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", border: "none", background: "#E74C3C", color: "#fff", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", border: "1.5px solid var(--border)", background: "transparent", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}