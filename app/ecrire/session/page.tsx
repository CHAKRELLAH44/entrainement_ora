"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSession, getCurrentUser } from "@/lib/storage";
import { Session } from "@/types/session";
import { getUserLang } from "@/lib/i18n";
import { getRandomWriteTopic } from "@/lib/topics";
import { getUserThemes } from "@/lib/themes-storage";
import ThemePicker from "@/components/ThemePicker";

type Step = "topic" | "write" | "saving" | "result";

const THEMES_LIST = [
  { code: "tech", label: "Tech", emoji: "💻" },
  { code: "sport", label: "Sport", emoji: "⚽" },
  { code: "philosophie", label: "Philosophie", emoji: "🧠" },
  { code: "societe", label: "Société", emoji: "🌍" },
  { code: "amour", label: "Amour", emoji: "❤️" },
  { code: "culture", label: "Culture", emoji: "🎭" },
];

export default function EcrireSessionPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [correction, setCorrection] = useState<string | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [isLoadingCorrection, setIsLoadingCorrection] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length;

  function rollTopic() {
    const t = getRandomWriteTopic();
    setTopic(t);
  }

  async function handleFinishWrite() {
    if (wordCount < 100) {
      alert("Vous devez écrire au minimum 100 mots.");
      return;
    }

    setStep("saving");
    setIsLoadingCorrection(true);

    let correctionText: string | null = null;
    try {
      const res = await fetch("/api/correct-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      correctionText = data.corrected || null;
      setCorrection(correctionText);
    } catch (err) {
      console.error("Erreur correction:", err);
    }

    setIsLoadingCorrection(false);

    const user = getCurrentUser();
    if (!user) return;

    const session: Session = {
      id: `writing-${Date.now()}`,
      date: new Date().toLocaleDateString("fr-FR"),
      topic: topic!,
      note: 0,
      audioUrl: null,
      text,
      timestamp: Date.now(),
      userNickname: user,
      correction: correctionText,
    };

    await saveSession(session);
    setStep("result");
  }

  // ── STEP : topic ──────────────────────────────────────
  if (step === "topic") {
    return (
      <div className="page-wrapper">
        <div className="card">
          <div className="nav-top">
            <button className="back-btn" onClick={() => router.push("/ecrire")}>&larr;</button>
            <div className="chip">Sujet</div>
            <div style={{ width: 24 }} />
          </div>

          {!topic ? (
            <>
              <h2>Tire ton sujet</h2>
              <p>Lance le de pour decouvrir ton sujet du jour.</p>

              {/* Thèmes actifs */}
              <div style={{ marginBottom: "1rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.6rem" }}>
                  🎯 Tes thèmes actifs
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
                  {getUserThemes().map((theme) => {
                    const found = THEMES_LIST.find((t) => t.code === theme);
                    if (!found) return null;
                    return (
                      <span key={theme} style={{ fontSize: "0.72rem", background: "#9B59B622", color: "#9B59B6", border: "1px solid #9B59B6", borderRadius: "20px", padding: "0.2rem 0.6rem", fontWeight: "700" }}>
                        {found.emoji} {found.label}
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowThemes(true)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "10px", border: "1.5px solid var(--border)", background: "transparent", color: "var(--muted)", fontFamily: "Lato, sans-serif", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                >
                  ✏️ Modifier les thèmes
                </button>
              </div>

              {showThemes && <ThemePicker onClose={() => setShowThemes(false)} />}

              <button className="btn btn-outline" onClick={rollTopic}>
                🎲 Lancer le de
              </button>
            </>
          ) : (
            <>
              {/* Sujet tiré — plus de bouton lancer */}
              <div className="topic-box" style={{ marginBottom: "1.5rem" }}>
                <div className="label">✍️ Sujet du jour</div>
                <div className="text">{topic}</div>
              </div>

              <button className="btn" onClick={() => setStep("write")}>
                Commencer à écrire ✍️
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── STEP : write ──────────────────────────────────────
  if (step === "write") {
    return (
      <div className="page-wrapper">
        <div className="card">
          <div className="nav-top">
            <button className="back-btn" onClick={() => setStep("topic")}>&larr;</button>
            <div className="chip">Ecriture</div>
            <div style={{ width: 24 }} />
          </div>

          <div className="topic-box" style={{ marginBottom: "1rem" }}>
            <div className="label">✍️ Sujet</div>
            <div className="text">{topic}</div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
              Minimum 100 mots
            </p>
            <span style={{
              fontSize: "0.82rem", fontWeight: "700",
              color: wordCount >= 100 ? "#27AE60" : "var(--btn)",
              background: wordCount >= 100 ? "#27AE6022" : "#F98F0B22",
              border: `1px solid ${wordCount >= 100 ? "#27AE60" : "var(--btn)"}`,
              borderRadius: "20px", padding: "0.2rem 0.6rem",
            }}>
              {wordCount} mots {wordCount >= 100 ? "✓" : ""}
            </span>
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Exprime ton point de vue..."
            style={{
              width: "100%",
              minHeight: "350px",
              padding: "1rem",
              border: "1.5px solid var(--border)",
              borderRadius: "12px",
              fontSize: "1rem",
              fontFamily: "inherit",
              resize: "vertical",
              background: "var(--bg)",
              color: "var(--text)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            className="btn"
            onClick={handleFinishWrite}
            disabled={wordCount < 100}
            style={{ opacity: wordCount < 100 ? 0.5 : 1, marginTop: "1rem" }}
          >
            Terminer et corriger 🤖
          </button>
        </div>
      </div>
    );
  }

  // ── STEP : saving ─────────────────────────────────────
  if (step === "saving") {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: "center" }}>
          <div className="chip">Sauvegarde</div>
          <p style={{ marginTop: "2rem", fontSize: "2rem" }}>🤖</p>
          <p>Correction IA en cours...</p>
        </div>
      </div>
    );
  }

  // ── STEP : result ─────────────────────────────────────
  if (step === "result") {
    return (
      <div className="page-wrapper">
        <div className="card">
          <div className="chip" style={{ display: "block", textAlign: "center" }}>Terminé</div>

          <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>✅</div>
            <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text)", margin: 0 }}>
              Séance enregistrée !
            </p>
          </div>

          {/* Sujet */}
          <div className="topic-box" style={{ marginBottom: "1rem" }}>
            <div className="label">✍️ Sujet</div>
            <div className="text">{topic}</div>
          </div>

          {/* Texte écrit */}
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.5rem" }}>
              📝 Ce que tu as écrit
            </p>
            <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem", whiteSpace: "pre-wrap", fontSize: "0.9rem", maxHeight: "200px", overflowY: "auto" }}>
              {text}
            </div>
          </div>

          {/* Correction masquable */}
          {correction && (
            <div style={{ marginBottom: "1rem" }}>
              {!showCorrection ? (
                <button
                  onClick={() => setShowCorrection(true)}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "2px solid var(--btn)", background: "transparent", color: "var(--btn)", fontFamily: "Lato, sans-serif", fontSize: "0.9rem", fontWeight: "700", cursor: "pointer" }}
                >
                  ✏️ Voir la correction IA
                </button>
              ) : (
                <div style={{ background: "var(--bg)", borderRadius: "12px", padding: "1rem", borderLeft: "3px solid var(--btn)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--btn)", margin: 0 }}>
                      ✅ Correction IA
                    </p>
                    <button onClick={() => setShowCorrection(false)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "Lato, sans-serif" }}>
                      Masquer ✕
                    </button>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: "1.7", margin: 0 }}>
                    {correction}
                  </p>
                </div>
              )}
            </div>
          )}

          <button className="btn btn-ghost" onClick={() => router.push("/ecrire/historique")}>
            📚 Voir mes écrits
          </button>
          <button className="btn" onClick={() => router.push("/")}>
            Retour à l accueil
          </button>
        </div>
      </div>
    );
  }

  return null;
}