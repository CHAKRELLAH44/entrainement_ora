"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveSession,
  getCurrentUser,
} from "@/lib/storage";
import { Session } from "@/types/session";

type Step = "topic" | "write" | "saving" | "result";

export default function EcrireSessionPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [correction, setCorrection] = useState<string | null>(null);
  const [isLoadingCorrection, setIsLoadingCorrection] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Get random topic
    fetch("/api/random-topic")
      .then((res) => res.json())
      .then((data) => setTopic(data.topic))
      .catch((err) => console.error("Erreur topic:", err));
  }, []);

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;

  function handleStartWrite() {
    setStep("write");
  }

  async function handleFinishWrite() {
    if (wordCount < 100) {
      alert("Vous devez écrire au minimum 100 mots.");
      return;
    }

    setStep("saving");
    setIsLoadingCorrection(true);

    // Get AI correction
    try {
      const res = await fetch("/api/correct-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setCorrection(data.correctedText);
    } catch (err) {
      console.error("Erreur correction:", err);
      setCorrection("Erreur lors de la correction automatique.");
    }

    setIsLoadingCorrection(false);

    // Save session
    const user = getCurrentUser();
    if (!user) return;

    const session: Session = {
      id: `writing-${Date.now()}`,
      date: new Date().toLocaleDateString("fr-FR"),
      topic,
      note: 0, // Pas de note pour l'écriture
      audioUrl: null,
      text : null,
      timestamp: Date.now(),
      userNickname: user,
      correction,
    };

    console.log("📝 Session avant sauvegarde:", session);
    await saveSession(session);
    console.log("✅ Session après sauvegarde");
    setStep("result");
  }

  function handleBackHome() {
    router.push("/");
  }

  if (step === "topic") {
    return (
      <div className="page-wrapper">
        <div className="card">
          <h2>Sujet du jour</h2>
          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎲</div>
            <p style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text)" }}>
              {topic || "Chargement..."}
            </p>
          </div>
          <button className="btn" onClick={handleStartWrite}>
            Commencer à écrire
          </button>
        </div>
      </div>
    );
  }

  if (step === "write") {
    return (
      <div className="page-wrapper">
        <div className="card">
          <h2>Écris ton texte</h2>
          <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
            Sujet : <strong>{topic}</strong>
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "1rem" }}>
            Minimum 100 mots. Compte actuel : <strong>{wordCount}</strong>
          </p>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Exprime ton point de vue..."
            style={{
              width: "100%",
              minHeight: "400px",
              padding: "1rem",
              border: "1.5px solid var(--border)",
              borderRadius: "12px",
              fontSize: "1rem",
              fontFamily: "inherit",
              resize: "vertical",
              background: "var(--bg)",
              color: "var(--text)",
            }}
          />
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <button
              className="btn"
              onClick={handleFinishWrite}
              disabled={wordCount < 100}
              style={{ opacity: wordCount < 100 ? 0.5 : 1 }}
            >
              Terminer et corriger
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "saving") {
    return (
      <div className="page-wrapper">
        <div className="card">
          <h2>Sauvegarde</h2>
          <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
            Analyse et sauvegarde en cours...
          </p>
          {isLoadingCorrection && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🤖</div>
              <p>Corriger avec IA...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "result") {
    return (
      <div className="page-wrapper">
        <div className="card">
          <h2>Terminé</h2>
          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <p style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text)" }}>
              Séance enregistrée !
            </p>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3>Ce que tu as écrit</h3>
            <div style={{
              background: "var(--bg)",
              border: "1.5px solid var(--border)",
              borderRadius: "12px",
              padding: "1rem",
              marginTop: "0.5rem",
              whiteSpace: "pre-wrap",
              fontSize: "0.9rem"
            }}>
              {text}
            </div>
          </div>

          {correction && (
            <div style={{ marginBottom: "2rem" }}>
              <h3>Correction IA</h3>
              <div style={{
                background: "var(--bg)",
                border: "1.5px solid var(--border)",
                borderRadius: "12px",
                padding: "1rem",
                marginTop: "0.5rem",
                whiteSpace: "pre-wrap",
                fontSize: "0.9rem"
              }}>
                {correction}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="btn btn-ghost" onClick={() => router.push("/ecrire/historique")}>
              📚 Voir mes écrits
            </button>
            <button className="btn" onClick={handleBackHome}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}