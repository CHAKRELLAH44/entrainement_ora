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
  const startedAtRef = useRef<string>(new Date().toISOString());

  const book = getBookById(bookId);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) { router.push("/login"); return; }
    setUser(currentUser);

    if (!book) { router.push("/lecture"); return; }

    // Charger la progression existante
    getReadingProgress(currentUser, bookId).then((progress) => {
      if (progress) {
        console.log("Progress loaded:", progress.currentChapter);
        setCurrentChapter(progress.currentChapter);
        startedAtRef.current = progress.startedAt;
      }
      setLoading(false);
    });
  }, [bookId]);

 async function saveProgress(chapterIndex: number, completed = false) {
  if (!user || !book) {
    console.log("saveProgress annule - user:", user, "book:", book);
    return;
  }
  setSaving(true);
  console.log("Sauvegarde chapitre:", chapterIndex, "user:", user, "bookId:", book.id);

  await saveReadingProgress({
    userNickname: user,
    bookId: book.id,
    currentChapter: chapterIndex,
    currentPage: 0,
    completed,
    startedAt: startedAtRef.current,
    completedAt: completed ? new Date().toISOString() : undefined,
  });

  console.log("Sauvegarde terminee");
  setSaving(false);
  setSaved(true);
  setTimeout(() => setSaved(false), 2000);
}

  async function nextChapter() {
    if (!book) return;
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
      const prev = currentChapter - 1;
      setCurrentChapter(prev);
      await saveProgress(prev, false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function stopReading() {
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

  return (
    <div className="page-wrapper">
      <div className="card">

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div className="chip" style={{ margin: 0 }}>
            {chapter.title}
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
            {currentChapter + 1} / {book.chapters.length}
          </span>
        </div>

        {/* Contenu */}
        <div style={{
          fontSize: "0.95rem",
          color: "var(--text)",
          lineHeight: "1.9",
          whiteSpace: "pre-wrap",
          fontFamily: "'Playfair Display', serif",
          letterSpacing: "0.01em",
        }}>
          {chapter.content}
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

        <button className="btn btn-ghost" style={{ marginTop: "0.75rem", fontSize: "0.85rem" }} onClick={stopReading}>
          💾 Sauvegarder et quitter
        </button>

      </div>
    </div>
  );
}