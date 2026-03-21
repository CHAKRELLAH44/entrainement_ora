"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkUserAllowed, setCurrentUser } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Android install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });

    // iPhone detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = (window.navigator as any).standalone;
    setIsIOS(ios && !standalone);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") setShowInstall(false);
    setDeferredPrompt(null);
  }

  async function handleLogin() {
    const trimmed = nickname.trim();
    if (!trimmed) { setError("Entre ton nickname."); return; }
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
        <div className="logo">🎙️ BlaBlа Gym</div>
        <h1>MAR7BAAA 👋</h1>
        <p>Entre ton nickname pour acceder a ton espace.</p>

        <input
          type="text"
          placeholder="Ton nickname..."
          value={nickname}
          onChange={(e) => { setNickname(e.target.value); setError(""); }}
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

        <button className="btn" onClick={handleLogin} disabled={loading} style={{ marginTop: "1rem" }}>
          {loading ? "Verification..." : "Se connecter"}
        </button>

        <button
          className="btn btn-ghost"
          style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}
          onClick={() => router.push(`/register?code=${process.env.NEXT_PUBLIC_INVITE_CODE}`)}
        >
          Pas encore de compte ? S inscrire
        </button>

        {/* Bouton install Android */}
        {showInstall && (
          <button
            onClick={handleInstall}
            style={{
              width: "100%",
              padding: "0.85rem",
              borderRadius: "12px",
              border: "1.5px solid var(--btn)",
              background: "transparent",
              color: "var(--btn)",
              fontFamily: "Lato, sans-serif",
              fontSize: "0.9rem",
              fontWeight: "700",
              cursor: "pointer",
              marginTop: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            📲 Installer l app
          </button>
        )}

        {/* Message install iPhone */}
        {isIOS && (
          <div style={{
            background: "var(--bg)",
            border: "1.5px solid var(--border)",
            borderRadius: "12px",
            padding: "0.85rem 1rem",
            marginTop: "0.75rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            textAlign: "left",
          }}>
            <span style={{ fontSize: "1.5rem" }}>📲</span>
            <div>
              <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.85rem" }}>
                Installer BlaBlаGym
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "0.25rem 0 0", lineHeight: "1.5" }}>
                Appuie sur <strong>📤 Partager</strong> puis <strong>"Sur l ecran d accueil"</strong>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}