"use client";

import { useEffect, useState, useRef } from "react";
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

  // Pronunciation
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [speaking, setSpeaking] = useState(false);

  const startedAtRef = useRef<string>(new Date().toISOString());
  const cardRef = useRef<HTMLDivElement>(null);

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
        window.speechSynthesis?.cancel();
        setSpeaking(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleWordClick(word: string, e: React.MouseEvent) {
    const clean = word.replace(/[.,!?;:«»"'()\n\r]/g, "").trim();
    if (!clean || clean.length < 2) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const cardRect = cardRef.current?.getBoundingClientRect();

    const x = rect.left - (cardRect?.left || 0);
    const y = rect.bottom - (cardRect?.top || 0) + 6;

    setSelectedWord(clean);
    setPopupPos({ x, y });
  }

  function speak(text: string, slow = false) {
    if (!text || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = slow ? 0.6 : 0.85;
    utterance.pitch = 1;

    // Chercher voix française
    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const frVoice =
        voices.find((v) => v.lang === "fr-FR" && v.localService) ||
        voices.find((v) => v.lang.startsWith("fr"));
      if (frVoice) utterance.voice = frVoice;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };

    // Les voix peuvent ne pas etre chargees immediatement
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = trySpeak;
    } else {
      trySpeak();
    }
  }

  function speakWord(word: string) {
    speak(word, true);
  }

  function speakSentence(word: string) {
    const content = book?.chapters[currentChapter]?.content || "";
    const sentences = content.split(/(?<=[.!?])\s+/);
    const sentence = sentences.find((s) =>
      s.toLowerCase().includes(word.toLowerCase())
    );
    if (sentence) speak(sentence.trim(), false);
    else speak(word, false);
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
    window.speechSynthesis?.cancel();
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
      window.speechSynthesis?.cancel();
      setSelectedWord(null);
      const prev = currentChapter - 1;
      setCurrentChapter(prev);
      await saveProgress(prev, false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function stopReading() {
    window.speechSynthesis?.cancel();
    await saveProgress(currentChapter, false);
    router.push("/lecture");
  }

  function renderContent(text: string) {
    return text.split("\n").map((line, lineIndex, lines) => (
      <span key={lineIndex}>
        {line.split(" ").map((word, wordIndex) => {
          const clean = word.replace(/[.,!?;:«»"'()\n\r]/g, "").trim();
          const isSelected = selectedWord === clean && clean.length > 1;
          return (
            <span
              key={wordIndex}
              className="word-span"
              onClick={(e) => handleWordClick(word, e)}
              style={{
                cursor: clean.length >= 2 ? "pointer" : "default",
                borderRadius: "4px",
                padding: "1px 2px",
                background: isSelected ? "#F98F0B44" : "transparent",
                color: isSelected ? "var(--btn)" : "var(--text)",
                fontWeight: isSelected ? "700" : "normal",
                transition: "background 0.15s",
                display: "inline",
              }}
            >
              {word}
            </span>
          );
        }).reduce((acc: React.ReactNode[], el, i) => {
          if (i === 0) return [el];
          return [...acc, " ", el];
        }, [])}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    ));
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

  return (
    <div className="page-wrapper">
      <div className="card" ref={cardRef} style={{ position: "relative" }}>

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
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          border: "1px solid var(--border)",
        }}>
          <span>💡</span>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>
            Appuie sur un mot pour entendre sa prononciation en francais
          </p>
        </div>

        {/* Contenu */}
        <div
          style={{
            fontSize: "0.95rem",
            lineHeight: "2.1",
            fontFamily: "'Playfair Display', serif",
            letterSpacing: "0.01em",
            userSelect: "none",
            position: "relative",
          }}
        >
          {renderContent(chapter.content)}
        </div>

        {/* Popup prononciation */}
        {selectedWord && (
          <div
            className="word-popup"
            style={{
              position: "absolute",
              left: Math.max(8, Math.min(popupPos.x - 80, (cardRef.current?.offsetWidth || 300) - 210)),
              top: popupPos.y,
              zIndex: 200,
              background: "var(--card)",
              border: "2px solid var(--btn)",
              borderRadius: "16px",
              padding: "1rem",
              boxShadow: "0 8px 32px #00000066",
              minWidth: "200px",
              maxWidth: "220px",
            }}
          >
            {/* Mot */}
            <p style={{
              fontWeight: "700",
              color: "var(--btn)",
              margin: "0 0 0.75rem",
              fontSize: "1.1rem",
              textAlign: "center",
              fontFamily: "'Playfair Display', serif",
            }}>
              {selectedWord}
            </p>

            {/* Bouton mot seul */}
            <button
              onClick={() => speakWord(selectedWord)}
              disabled={speaking}
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "10px",
                border: "none",
                background: speaking ? "#F98F0B88" : "var(--btn)",
                color: "#fff",
                fontFamily: "Lato, sans-serif",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: speaking ? "wait" : "pointer",
                marginBottom: "0.4rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                transition: "background 0.2s",
              }}
            >
              {speaking ? "🔊 En cours..." : "🔊 Prononcer le mot"}
            </button>

            {/* Bouton phrase */}
            <button
              onClick={() => speakSentence(selectedWord)}
              disabled={speaking}
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "10px",
                border: "1.5px solid var(--border)",
                background: "transparent",
                color: "var(--text)",
                fontFamily: "Lato, sans-serif",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: speaking ? "wait" : "pointer",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }}
            >
              🔊 Prononcer la phrase
            </button>

            {/* Fermer */}
            <button
              onClick={() => {
                setSelectedWord(null);
                window.speechSynthesis?.cancel();
                setSpeaking(false);
              }}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "var(--muted)",
                fontSize: "0.75rem",
                cursor: "pointer",
                fontFamily: "Lato, sans-serif",
                textAlign: "center",
              }}
            >
              Fermer ✕
            </button>
          </div>
        )}

        {/* Statut sauvegarde */}
        {saved && (
          <p style={{ fontSize: "0.75rem", color: "#27AE60", textAlign: "center", margin: "1rem 0 0" }}>
            ✓ Progression sauvegardee — Chapitre {currentChapter + 1}
          </p>
        )}
        {saving && (
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", margin: "1rem 0 0" }}>
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