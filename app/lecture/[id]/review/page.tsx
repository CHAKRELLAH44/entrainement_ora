"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCurrentUser } from "@/lib/storage";
import { getBookById } from "@/data/books";
import { saveReadingReview } from "@/lib/reading-storage";

type Step = "form" | "correcting" | "review-correction" | "saving";

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [user, setUser] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [summary, setSummary] = useState("");
  const [word1, setWord1] = useState("");
  const [def1, setDef1] = useState("");
  const [word2, setWord2] = useState("");
  const [def2, setDef2] = useState("");
  const [error, setError] = useState("");

  // Résultats correction
  const [summaryCorrected, setSummaryCorrected] = useState<string | null>(null);
  const [wordsFeedback, setWordsFeedback] = useState<{
    word1: { correct: boolean; feedback: string };
    word2: { correct: boolean; feedback: string };
  } | null>(null);

  const book = getBookById(bookId);
  const wordCount = summary.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = wordCount >= 100 && word1.trim() && def1.trim() && word2.trim() && def2.trim();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) { router.push("/login"); return; }
    setUser(currentUser);
    if (!book) { router.push("/lecture"); return; }
  }, [bookId]);

  async function handleCorrect() {
    if (!canSubmit) {
      if (wordCount < 100) setError(`Il manque ${100 - wordCount} mots dans ton resume.`);
      return;
    }
    setError("");
    setStep("correcting");

    try {
      const res = await fetch("/api/correct-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, word1, def1, word2, def2 }),
      });
      const data = await res.json();
      setSummaryCorrected(data.summaryCorrected);
      setWordsFeedback(data.wordsFeedback);
      setStep("review-correction");
    } catch {
      setStep("form");
      setError("Erreur lors de la correction. Reessaie.");
    }
  }

  async function handleSave() {
    if (!user || !book) return;
    setStep("saving");

    await saveReadingReview({
      userNickname: user,
      bookId: book.id,
      bookTitle: book.title,
      summary,
      summaryCorrected,
      wordsLearned: [
        { word: word1.trim(), definition: def1.trim() },
        { word: word2.trim(), definition: def2.trim() },
      ],
      timestamp: Date.now(),
    });

    router.push("/lecture/success");
  }

  if (!book) return null;

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="nav-top">
          <button className="back-btn" onClick={() => step === "review-correction" ? setStep("form") : router.push(`/lecture/${bookId}`)}>
            &larr;
          </button>
          <div className="chip">Bilan de lecture</div>
          <div style={{ width: 24 }} />
        </div>

        <div style={{ textAlign: "center", margin: "0.5rem 0 1.5rem" }}>
          <div style={{ fontSize: "3rem" }}>{book.cover}</div>
          <h2 style={{ margin: "0.5rem 0 0.25rem" }}>{book.title}</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: 0 }}>Tu as termine ce livre !</p>
        </div>

        {/* ---- STEP : form ---- */}
        {step === "form" && (
          <>
            {/* Resume */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--btn)", marginBottom: "0.5rem" }}>
                ✍️ Ton resume (minimum 100 mots)
              </p>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Qu est-ce que tu as appris de cette lecture ? Qu est-ce qui t a marque ?"
                rows={7}
                style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "0.9rem", lineHeight: "1.6", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem" }}>
                <span style={{ fontSize: "0.78rem", color: wordCount >= 100 ? "#27AE60" : "var(--muted)" }}>
                  {wordCount} / 100 mots minimum
                </span>
                {wordCount >= 100 && <span style={{ fontSize: "0.78rem", color: "#27AE60" }}>✓ Suffisant</span>}
              </div>
            </div>

            {/* Mots appris */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--btn)", marginBottom: "0.75rem" }}>
                📚 2 nouveaux mots appris
              </p>
              <div style={{ marginBottom: "0.75rem" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.4rem" }}>Mot 1</p>
                <input type="text" placeholder="Le mot..." value={word1} onChange={(e) => setWord1(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "0.9rem", outline: "none", marginBottom: "0.4rem", boxSizing: "border-box" }} />
                <input type="text" placeholder="Sa definition..." value={def1} onChange={(e) => setDef1(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.4rem" }}>Mot 2</p>
                <input type="text" placeholder="Le mot..." value={word2} onChange={(e) => setWord2(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "0.9rem", outline: "none", marginBottom: "0.4rem", boxSizing: "border-box" }} />
                <input type="text" placeholder="Sa definition..." value={def2} onChange={(e) => setDef2(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontFamily: "Lato, sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            {error && <p style={{ color: "#E74C3C", fontSize: "0.85rem", textAlign: "center", marginBottom: "0.75rem" }}>{error}</p>}

            <button className="btn" onClick={handleCorrect} disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5 }}>
              🤖 Corriger avec IA
            </button>
            {!canSubmit && (
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", textAlign: "center", marginTop: "0.5rem" }}>
                {wordCount < 100 ? `Ecris encore ${100 - wordCount} mots` : "Remplis les 2 mots et leurs definitions"}
              </p>
            )}
          </>
        )}

        {/* ---- STEP : correcting ---- */}
        {step === "correcting" && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <p style={{ fontSize: "2rem" }}>🤖</p>
            <p style={{ color: "var(--muted)" }}>Correction en cours...</p>
          </div>
        )}

        {/* ---- STEP : review-correction ---- */}
        {step === "review-correction" && (
          <>
            {/* Resume original */}
            <div style={{ background: "var(--bg)", borderRadius: "14px", padding: "1.25rem", margin: "0.75rem 0", borderLeft: "4px solid #9A9A9A" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.5rem" }}>
                📝 Ce que tu as ecrit
              </p>
              <p style={{ fontSize: "0.88rem", color: "var(--text)", lineHeight: "1.7", fontStyle: "italic", margin: 0 }}>
                {summary}
              </p>
            </div>

            {/* Resume corrigé */}
            {summaryCorrected && (
              <div style={{ background: "var(--bg)", borderRadius: "14px", padding: "1.25rem", margin: "0.75rem 0", borderLeft: "4px solid var(--btn)" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--btn)", marginBottom: "0.5rem" }}>
                  ✅ Resume corrige
                </p>
                <p style={{ fontSize: "0.88rem", color: "var(--text)", lineHeight: "1.7", margin: 0 }}>
                  {summaryCorrected}
                </p>
              </div>
            )}

            {/* Feedback mots */}
            {wordsFeedback && (
              <div style={{ background: "var(--bg)", borderRadius: "14px", padding: "1.25rem", margin: "0.75rem 0" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--btn)", marginBottom: "0.75rem" }}>
                  📚 Tes mots appris
                </p>
                {[
                  { word: word1, def: def1, fb: wordsFeedback.word1 },
                  { word: word2, def: def2, fb: wordsFeedback.word2 },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: i === 0 ? "0.75rem" : 0, paddingBottom: i === 0 ? "0.75rem" : 0, borderBottom: i === 0 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontWeight: "700", color: "var(--text)", margin: 0 }}>{item.word}</p>
                      <span style={{ fontSize: "0.8rem", color: item.fb.correct ? "#27AE60" : "#E74C3C", fontWeight: "700" }}>
                        {item.fb.correct ? "✓ Correct" : "✗ A revoir"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "0.2rem 0 0", fontStyle: "italic" }}>
                      Ta definition : {item.def}
                    </p>
                    {!item.fb.correct && (
                      <p style={{ fontSize: "0.82rem", color: "#27AE60", margin: "0.3rem 0 0" }}>
                        💡 {item.fb.feedback}
                      </p>
                    )}
                    {item.fb.correct && (
                      <p style={{ fontSize: "0.82rem", color: "#27AE60", margin: "0.3rem 0 0" }}>
                        {item.fb.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button className="btn" onClick={handleSave}>
              Valider et terminer 🎉
            </button>
            <button className="btn btn-ghost" style={{ marginTop: "0.5rem" }} onClick={() => setStep("form")}>
              Modifier mon resume
            </button>
          </>
        )}

        {/* ---- STEP : saving ---- */}
        {step === "saving" && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <p style={{ fontSize: "2rem" }}>💾</p>
            <p style={{ color: "var(--muted)" }}>Sauvegarde en cours...</p>
          </div>
        )}

      </div>
    </div>
  );
}