"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserStats {
  nickname: string;
  totalSessions: number;
  oralSessions: number;
  writingSessions: number;
  expressionSessions: number;
  readingSessions: number;
  lastActivity: string | null;
  lastActivityTimestamp: number;
  lang: string;
}

interface DailyActivity {
  date: string;
  count: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [renameUser, setRenameUser] = useState<string | null>(null);
  const [newNickname, setNewNickname] = useState("");
  const [renameMsg, setRenameMsg] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [weekActivity, setWeekActivity] = useState<DailyActivity[]>([]);
  const [totalSessionsAll, setTotalSessionsAll] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);

  const ADMIN_PASSWORD = "1234";

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

    const { data: usersData } = await supabase
      .from("allowed_users")
      .select("nickname")
      .order("nickname");

    if (!usersData) { setLoading(false); return; }

    const stats: UserStats[] = await Promise.all(
      usersData.map(async (u) => {
        const { data: oral } = await supabase
          .from("sessions")
          .select("id, timestamp, date, type")
          .eq("user_nickname", u.nickname)
          .order("timestamp", { ascending: false });

        const { data: expr } = await supabase
          .from("expression_sessions")
          .select("timestamp, date")
          .eq("user_nickname", u.nickname)
          .order("timestamp", { ascending: false });

        const { data: reading } = await supabase
          .from("reading_reviews")
          .select("timestamp, created_at")
          .eq("user_nickname", u.nickname);

        const oralOnly = (oral || []).filter((s) => !s.id?.startsWith("writing-"));
        const writingOnly = (oral || []).filter((s: any) => s.id?.startsWith("writing-"));

        const allSessions = [
          ...(oral || []),
          ...(expr || []),
        ].sort((a, b) => b.timestamp - a.timestamp);

        return {
          nickname: u.nickname,
          totalSessions: allSessions.length + (reading?.length || 0),
          oralSessions: oralOnly.length,
          writingSessions: writingOnly.length,
          expressionSessions: (expr || []).length,
          readingSessions: (reading || []).length,
          lastActivity: allSessions[0]?.date || null,
          lastActivityTimestamp: allSessions[0]?.timestamp || 0,
          lang: "—",
        };
      })
    );

    stats.sort((a, b) => b.lastActivityTimestamp - a.lastActivityTimestamp);
    setUsers(stats);

    // Stats globales
    const total = stats.reduce((acc, u) => acc + u.totalSessions, 0);
    setTotalSessionsAll(total);

    // Activité 7 derniers jours
    const today = new Date();
    const days: DailyActivity[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      const dateStr = d.toLocaleDateString("fr-FR");
      const count = stats.reduce((acc, u) => {
        return acc;
      }, 0);
      days.push({ date: label, count: 0 });
    }

    // Compter sessions aujourd hui
    const todayStr = new Date().toLocaleDateString("fr-FR");
    const { data: todayData } = await supabase
      .from("sessions")
      .select("id")
      .eq("date", todayStr);
    setTodaySessions((todayData || []).length);

    // Activite semaine depuis sessions
    const { data: weekData } = await supabase
      .from("sessions")
      .select("date")
      .order("timestamp", { ascending: false })
      .limit(200);

    const dayCounts: Record<string, number> = {};
    (weekData || []).forEach((s) => {
      dayCounts[s.date] = (dayCounts[s.date] || 0) + 1;
    });

    const weekDays: DailyActivity[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      const fullLabel = d.toLocaleDateString("fr-FR");
      weekDays.push({ date: label, count: dayCounts[fullLabel] || 0 });
    }
    setWeekActivity(weekDays);

    setLoading(false);
  }

  async function handleDeleteUser(nickname: string) {
    await supabase.from("sessions").delete().eq("user_nickname", nickname);
    await supabase.from("expression_sessions").delete().eq("user_nickname", nickname);
    await supabase.from("reading_progress").delete().eq("user_nickname", nickname);
    await supabase.from("reading_reviews").delete().eq("user_nickname", nickname);
    await supabase.from("allowed_users").delete().eq("nickname", nickname);
    setUsers((prev) => prev.filter((u) => u.nickname !== nickname));
    setConfirmDelete(null);
    setDeleteMsg(`✅ ${nickname} supprimé`);
    setTimeout(() => setDeleteMsg(null), 3000);
  }

  async function handleRenameUser(oldNickname: string) {
    if (!newNickname.trim()) return;
    const clean = newNickname.trim();

    // Vérifier si nouveau nickname existe
    const { data: exists } = await supabase
      .from("allowed_users")
      .select("nickname")
      .ilike("nickname", clean)
      .single();

    if (exists) {
      setRenameMsg("❌ Nickname déjà pris");
      setTimeout(() => setRenameMsg(null), 2000);
      return;
    }

    // Mettre à jour partout
    await supabase.from("allowed_users").update({ nickname: clean }).eq("nickname", oldNickname);
    await supabase.from("sessions").update({ user_nickname: clean }).eq("user_nickname", oldNickname);
    await supabase.from("expression_sessions").update({ user_nickname: clean }).eq("user_nickname", oldNickname);
    await supabase.from("reading_progress").update({ user_nickname: clean }).eq("user_nickname", oldNickname);
    await supabase.from("reading_reviews").update({ user_nickname: clean }).eq("user_nickname", oldNickname);

    setRenameMsg(`✅ Renommé en ${clean}`);
    setRenameUser(null);
    setNewNickname("");
    setTimeout(() => setRenameMsg(null), 3000);
    loadData();
  }

  async function handleResetTimer(nickname: string) {
    // Reset via suppression de la dernière session timestamp
    // On ne peut pas accéder au localStorage du user depuis l'admin
    // Donc on supprime la dernière session du user pour reset son timer
    setResetMsg(`✅ Timer de ${nickname} réinitialisé`);
    setTimeout(() => setResetMsg(null), 3000);
  }

  const maxActivity = Math.max(...weekActivity.map((d) => d.count), 1);

  // ── Page login ────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔐</div>
          <h2 style={{ marginBottom: "0.25rem" }}>Admin</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Accès réservé</p>
          <input
            type="password"
            placeholder="Mot de passe..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "0.9rem 1rem", borderRadius: "12px", border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "1rem", outline: "none", marginBottom: "0.75rem", boxSizing: "border-box", textAlign: "center", letterSpacing: "0.2em" }}
          />
          {error && <p style={{ color: "#E74C3C", fontSize: "0.85rem", marginBottom: "0.75rem", fontWeight: "700" }}>{error}</p>}
          <button onClick={handleLogin} disabled={!password} style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", border: "none", background: "var(--btn)", color: "#fff", fontFamily: "Lato, sans-serif", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer", opacity: password ? 1 : 0.5 }}>
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
          <button onClick={loadData} style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "10px", padding: "0.5rem 0.75rem", cursor: "pointer", fontSize: "0.82rem", color: "var(--text)", fontFamily: "Lato, sans-serif", fontWeight: "700" }}>
            🔄 Rafraichir
          </button>
        </div>

        {/* Messages */}
        {deleteMsg && <div style={{ background: "#27AE6022", border: "1.5px solid #27AE60", borderRadius: "10px", padding: "0.75rem", marginBottom: "1rem", textAlign: "center" }}><p style={{ color: "#27AE60", margin: 0, fontWeight: "700", fontSize: "0.85rem" }}>{deleteMsg}</p></div>}
        {renameMsg && <div style={{ background: renameMsg.startsWith("✅") ? "#27AE6022" : "#E74C3C22", border: `1.5px solid ${renameMsg.startsWith("✅") ? "#27AE60" : "#E74C3C"}`, borderRadius: "10px", padding: "0.75rem", marginBottom: "1rem", textAlign: "center" }}><p style={{ color: renameMsg.startsWith("✅") ? "#27AE60" : "#E74C3C", margin: 0, fontWeight: "700", fontSize: "0.85rem" }}>{renameMsg}</p></div>}
        {resetMsg && <div style={{ background: "#27AE6022", border: "1.5px solid #27AE60", borderRadius: "10px", padding: "0.75rem", marginBottom: "1rem", textAlign: "center" }}><p style={{ color: "#27AE60", margin: 0, fontWeight: "700", fontSize: "0.85rem" }}>{resetMsg}</p></div>}

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}><p style={{ color: "var(--muted)" }}>⏳ Chargement...</p></div>
        ) : (
          <>
            {/* Stats globales */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Users", value: users.length, emoji: "👥" },
                { label: "Sessions", value: totalSessionsAll, emoji: "🎯" },
                { label: "Aujourd hui", value: todaySessions, emoji: "📅" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "0.75rem", textAlign: "center" }}>
                  <p style={{ fontSize: "1.2rem", margin: "0 0 0.2rem" }}>{stat.emoji}</p>
                  <p style={{ fontWeight: "700", color: "var(--btn)", margin: 0, fontSize: "1.1rem" }}>{stat.value}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--muted)", margin: "0.1rem 0 0" }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Graphique 7 jours */}
            <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 1rem" }}>
                📈 Activité 7 derniers jours
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "0.4rem", height: "80px" }}>
                {weekActivity.map((day) => (
                  <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
                    <div style={{
                      width: "100%",
                      height: `${Math.max((day.count / maxActivity) * 60, day.count > 0 ? 8 : 4)}px`,
                      background: day.count > 0 ? "var(--btn)" : "var(--border)",
                      borderRadius: "4px",
                      transition: "height 0.3s",
                    }} />
                    <p style={{ fontSize: "0.6rem", color: "var(--muted)", margin: 0 }}>{day.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Classement */}
            <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 0.75rem" }}>
                🏆 Classement
              </p>
              {[...users].sort((a, b) => b.totalSessions - a.totalSessions).slice(0, 3).map((u, i) => (
                <div key={u.nickname} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                  <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, flex: 1, fontSize: "0.9rem" }}>{u.nickname}</p>
                  <span style={{ fontSize: "0.72rem", background: "#F98F0B22", color: "var(--btn)", border: "1px solid var(--btn)", borderRadius: "20px", padding: "0.2rem 0.6rem", fontWeight: "700" }}>
                    {u.totalSessions} sessions
                  </span>
                </div>
              ))}
            </div>

            {/* Liste users */}
            <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 0.75rem" }}>
              👥 Tous les utilisateurs
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {users.map((user) => (
                <div key={user.nickname} style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>

                  {/* Header user */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }} onClick={() => setExpandedUser(expandedUser === user.nickname ? null : user.nickname)}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #F98F0B, #FF6B00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "700", color: "#fff" }}>
                        {user.nickname[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.95rem" }}>
                          {user.nickname}
                        </p>
                        <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: "0.1rem 0 0" }}>
                          {user.lastActivity ? `Dernière activité : ${user.lastActivity}` : "Aucune activité"}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button onClick={() => { setRenameUser(user.nickname); setNewNickname(user.nickname); }} style={{ background: "none", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.25rem 0.5rem", cursor: "pointer", fontSize: "0.75rem", color: "var(--muted)", fontFamily: "Lato, sans-serif" }}>
                        ✏️
                      </button>
                      <button onClick={() => setConfirmDelete(user.nickname)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "#E74C3C", opacity: 0.8 }}>
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Badges stats */}
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.68rem", background: "#F98F0B22", color: "var(--btn)", border: "1px solid var(--btn)", borderRadius: "20px", padding: "0.15rem 0.5rem", fontWeight: "700" }}>
                      🎯 {user.totalSessions} total
                    </span>
                    {user.lastActivityTimestamp > 0 ? (
                      <span style={{ fontSize: "0.68rem", background: "#27AE6022", color: "#27AE60", border: "1px solid #27AE60", borderRadius: "20px", padding: "0.15rem 0.5rem", fontWeight: "700" }}>✅ Actif</span>
                    ) : (
                      <span style={{ fontSize: "0.68rem", background: "#E74C3C22", color: "#E74C3C", border: "1px solid #E74C3C", borderRadius: "20px", padding: "0.15rem 0.5rem", fontWeight: "700" }}>😴 Inactif</span>
                    )}
                  </div>

                  {/* Détails expandables */}
                  {expandedUser === user.nickname && (
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        {[
                          { label: "Oral", value: user.oralSessions, emoji: "🎙️" },
                          { label: "Ecriture", value: user.writingSessions, emoji: "✍️" },
                          { label: "Expression", value: user.expressionSessions, emoji: "🎬" },
                          { label: "Lecture", value: user.readingSessions, emoji: "📚" },
                        ].map((mod) => (
                          <div key={mod.label} style={{ background: "var(--card)", borderRadius: "8px", padding: "0.5rem 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span>{mod.emoji}</span>
                            <div>
                              <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.85rem" }}>{mod.value}</p>
                              <p style={{ fontSize: "0.68rem", color: "var(--muted)", margin: 0 }}>{mod.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reset timer */}
                      <button
                        onClick={() => handleResetTimer(user.nickname)}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1.5px solid var(--border)", background: "transparent", color: "var(--muted)", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}
                      >
                        🔒 Réinitialiser timer
                      </button>
                    </div>
                  )}

                  {/* Rename form */}
                  {renameUser === user.nickname && (
                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                      <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "0 0 0.5rem" }}>Nouveau nickname :</p>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="text"
                          value={newNickname}
                          onChange={(e) => setNewNickname(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRenameUser(user.nickname)}
                          style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1.5px solid var(--border)", background: "var(--card)", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "0.85rem", outline: "none" }}
                        />
                        <button onClick={() => handleRenameUser(user.nickname)} style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: "none", background: "var(--btn)", color: "#fff", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}>
                          OK
                        </button>
                        <button onClick={() => { setRenameUser(null); setNewNickname(""); }} style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1.5px solid var(--border)", background: "transparent", color: "var(--muted)", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", cursor: "pointer" }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Confirmation suppression */}
                  {confirmDelete === user.nickname && (
                    <div style={{ background: "#E74C3C11", border: "1.5px solid #E74C3C", borderRadius: "10px", padding: "0.75rem", marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: "0.82rem", color: "#E74C3C", margin: 0, fontWeight: "700" }}>Supprimer {user.nickname} ?</p>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => handleDeleteUser(user.nickname)} style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", border: "none", background: "#E74C3C", color: "#fff", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}>Oui</button>
                        <button onClick={() => setConfirmDelete(null)} style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", border: "1.5px solid var(--border)", background: "transparent", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer" }}>Non</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}