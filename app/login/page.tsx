"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkUserAllowed, setCurrentUser } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("Entre ton nickname.");
      return;
    }

    setLoading(true);
    setError("");

    const allowed = await checkUserAllowed(trimmed);

    if (!allowed) {
      setError("Nickname non reconnu. Essaie encore.");
      setLoading(false);
      return;
    }

    setCurrentUser(trimmed);
    router.push("/");
  }

  return (
    <div className="page-wrapper">
      <div className="card" style={{ textAlign: "center" }}>
        <div className="logo">Parole Libre</div>
        <h1>MAR7BAAA 👋</h1>
        <p>Entre ton nickname pour acceder a ton espace.</p>

        <input
          type="text"
          placeholder="Ton nickname..."
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{
            width: "100%",
            padding: "1rem",
            borderRadius: "12px",
            border: "1.5px solid var(--border)",
            fontFamily: "Lato, sans-serif",
            fontSize: "1rem",
            color: "var(--text)",
            background: "var(--bg)",
            outline: "none",
            marginTop: "1rem",
            textAlign: "center",
          }}
        />

        {error && (
          <p style={{ color: "#C0392B", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            {error}
          </p>
        )}

        <button className="btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Verification..." : "Se connecter"}
        </button>
      </div>
    </div>
  );
}