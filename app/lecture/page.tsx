"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCurrentUser } from "@/lib/storage";
import { getBookById } from "@/data/books";
import { getReadingProgress, saveReadingProgress } from "@/lib/reading-storage";

export default function ReadingPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [user, setUser] = useState<string | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pronunciation popup
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [speaking, setSpeaking] = useState(false);

  const startedAtRef = useRef<string>(new Date().toISOString());
  const contentRef = useRef<HTMLDivElement>(null);

  const book = getBookById(bookId);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) { router.push("/login"); return; }
    setUser(currentUser);
    if (!book) { router.push("/lecture"); return; }

    getReadingProgress(currentUser, bookId).then((progress) => {
      if (progress) {
        setCurrentChapter(progress.currentChapter);
        startedAtRef.current = progress.startedAt;
      }
      setLoading(false);
    });
  }, [bookId]);

  // Fermer popup si click ailleurs
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".word-popup") && !target.closest(".word-span")) {
        setSelectedWord(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleWordClick(word: string, e: React.MouseEvent) {
    const clean = word.replace(/[.,!?;:«»"'()\n]/g, "").trim();
    if (!clean || clean.length < 2) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const cardRect = contentRef.current?.closest(".card")?.getBoundingClientRect();

    setSelectedWord(clean);
    setPopupPos({
      x: rect.left - (cardRect?.left || 0),
      y: rect.top - (cardRect?.top || 0) - 10,
    });
  }

  function speakWord(word: string) {
    if (!word) return;
    window.speechSynthesis.cancel();
    setSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "fr-FR";
    utterance.rate = 0.8; // un peu plus lent pour bien entendre
    utterance.pitch = 1;

    // Chercher une voix française
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(
      (v) => v.lang.startsWith("fr") && !v.name.includes("Google") 
    ) || voices.find((v) => v.lang.startsWith("fr"));
    if (frVoice) utterance.voice = frVoice;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  function speakSentence(word: string) {
    // Chercher la phrase qui contient le mot dans le chapitre
    const content = book?.chapters[currentChapter]?.content || "";
    const sentences = content.split(/[.!?]+/);
    const sentence = sentences.find((s) =>
      s.toLowerCase().includes(word.toLowerCase())
    );

    if (sentence) {
      window.speechSynthesis.cancel();
      setSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.lang = "fr-FR";
      utterance.rate = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const frVoice = voices.find((v) => v.lang.startsWith("fr"));
      if (frVoice) utterance.voice = frVoice;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }

  async function saveProgress(chapterIndex: number, completed = false) {
    if (!user || !book) return;
    setSaving(true);

    await saveReadingProgress({
      userNickname: user,
      bookId: book.id,
      currentChapter: chapterIndex,
      currentPage: 0,
      completed,
      startedAt: startedAtRef.current,
      completedAt: completed ? new Date().toISOString() : undefined,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function nextChapter() {
    if (!book) return;
    window.speechSynthesis.cancel();
    setSelectedWord(null);
    const isLast = currentChapter >= book.chapters.length - 1;
    if (isLast) {
      await saveProgress(currentChapter, true);
      router.push(`/lecture/${bookId}/review`);
    } else {
      const next = currentChapter + 1;
      setCurrentChapter(next);
      await saveProgress(next, false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function prevChapter() {
    if (currentChapter > 0) {
      window.speechSynthesis.cancel();
      setSelectedWord(null);
      const prev = currentChapter - 1;
      setCurrentChapter(prev);
      await saveProgress(prev, false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function stopReading() {
    window.speechSynthesis.cancel();
    await saveProgress(currentChapter, false);
    router.push("/lecture");
  }

  if (!book || loading) return (
    <div className="page-wrapper">
      <div className="card" style={{ textAlign: "center" }}>
        <p>⏳ Chargement...</p>
      </div>
    </div>
  );

  const chapter = book.chapters[currentChapter];
  const isLast = currentChapter >= book.chapters.length - 1;
  const progressPercent = Math.round(((currentChapter + 1) / book.chapters.length) * 100);

  // Transformer le texte en mots cliquables
  function renderContent(text: string) {
    return text.split("\n").map((line, lineIndex) => (
      <span key={lineIndex}>
        {line.split(" ").map((word, wordIndex) => (
          <span
            key={wordIndex}
            className="word-span"
            onClick={(e) => handleWordClick(word, e)}
            style={{
              cursor: "pointer",
              borderRadius: "3px",
              padding: "0 1px",
              transition: "background 0.15s",
              background: selectedWord === word.replace(/[.,!?;:«»"'()\n]/g, "").trim()
                ? "#F98F0B33"
                : "transparent",
            }}
          >
            {word}{" "}
          </span>
        ))}
        {lineIndex < text.split("\n").length - 1 && <br />}
      </span>
    ));
  }

  return (
    <div className="page-wrapper">
      <div className="card" style={{ position: "relative" }}>

        {/* Header */}
        <div className="nav-top">
          <button className="back-btn" onClick={stopReading}>&larr;</button>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.9rem" }}>
              {book.title}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>
              {book.author}
            </p>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--btn)", fontWeight: "700", minWidth: 40, textAlign: "right" }}>
            {progressPercent}%
          </div>
        </div>

        {/* Barre de progression */}
        <div style={{ height: "3px", background: "var(--border)", borderRadius: "3px", margin: "0.5rem 0 1.25rem" }}>
          <div style={{ height: "100%", width: `${progressPercent}%`, background: "var(--btn)", borderRadius: "3px", transition: "width 0.5s" }} />
        </div>

        {/* Info chapitre */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <div className="chip" style={{ margin: 0 }}>{chapter.title}</div>
          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
            {currentChapter + 1} / {book.chapters.length}
          </span>
        </div>

        {/* Tip */}
        <div style={{
          background: "var(--bg)",
          borderRadius: "10px",
          padding: "0.5rem 0.75rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}>
          <span style={{ fontSize: "0.85rem" }}>💡</span>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>
            Clique sur un mot pour entendre sa prononciation
          </p>
        </div>

        {/* Popup prononciation */}
        {selectedWord && (
          <div
            className="word-popup"
            style={{
              position: "absolute",
              left: Math.min(popupPos.x, 200),
              top: popupPos.y + 80,
              zIndex: 100,
              background: "var(--card)",
              border: "1.5px solid var(--btn)",
              borderRadius: "14px",
              padding: "0.75rem 1rem",
              boxShadow: "0 8px 24px #00000055",
              minWidth: "160px",
            }}
          >
            <p style={{
              fontWeight: "700",
              color: "var(--text)",
              margin: "0 0 0.6rem",
              fontSize: "1rem",
              textAlign: "center",
            }}>
              {selectedWord}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <button
                onClick={() => speakWord(selectedWord)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "none",
                  background: speaking ? "#F98F0B55" : "var(--btn)",
                  color: "#fff",
                  fontFamily: "Lato, sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                }}
              >
                {speaking ? "⏸️" : "🔊"} Prononcer le mot
              </button>
              <button
                onClick={() => speakSentence(selectedWord)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "1.5px solid var(--border)",
                  background: "transparent",
                  color: "var(--muted)",
                  fontFamily: "Lato, sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                }}
              >
                🔊 Prononcer la phrase
              </button>
            </div>
            <button
              onClick={() => setSelectedWord(null)}
              style={{
                marginTop: "0.4rem",
                width: "100%",
                background: "none",
                border: "none",
                color: "var(--muted)",
                fontSize: "0.75rem",
                cursor: "pointer",
                fontFamily: "Lato, sans-serif",
              }}
            >
              Fermer
            </button>
          </div>
        )}

        {/* Contenu du chapitre */}
        <div
          ref={contentRef}
          style={{
            fontSize: "0.95rem",
            color: "var(--text)",
            lineHeight: "2",
            fontFamily: "'Playfair Display', serif",
            letterSpacing: "0.01em",
            userSelect: "none",
          }}
        >
          {renderContent(chapter.content)}
        </div>

        {/* Statut sauvegarde */}
        {saved && (
          <p style={{ fontSize: "0.75rem", color: "#27AE60", textAlign: "center", margin: "0.75rem 0" }}>
            ✓ Progression sauvegardee — Chapitre {currentChapter + 1}
          </p>
        )}
        {saving && (
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", margin: "0.75rem 0" }}>
            Sauvegarde...
          </p>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
          {currentChapter > 0 && (
            <button className="btn btn-ghost" style={{ flex: 1, marginTop: 0 }} onClick={prevChapter}>
              &larr; Precedent
            </button>
          )}
          <button
            className="btn"
            style={{ flex: 2, marginTop: 0, background: isLast ? "#27AE60" : "var(--btn)" }}
            onClick={nextChapter}
          >
            {isLast ? "Terminer le livre ✓" : "Chapitre suivant →"}
          </button>
        </div>

        <button
          className="btn btn-ghost"
          style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}
          onClick={stopReading}
        >
          💾 Sauvegarder et quitter
        </button>

      </div>
    </div>
  );
}