"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/storage";
import { getAllReadingProgress, hasCompletedReview, getReadingReviews } from "@/lib/reading-storage";
import { BOOKS } from "@/data/books";
import { ReadingProgress, ReadingReview } from "@/types/books";

export default function LecturePage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, ReadingProgress>>({});
  const [reviewedBooks, setReviewedBooks] = useState<Record<string, boolean>>({});
  const [reviews, setReviews] = useState<ReadingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) { router.push("/login"); return; }
    setUser(currentUser);

    console.log("Chargement lecture pour:", currentUser);

    getAllReadingProgress(currentUser).then(async (progresses) => {
      console.log("Progresses:", progresses);
      const map: Record<string, ReadingProgress> = {};
      progresses.forEach((p) => { map[p.bookId] = p; });
      setProgressMap(map);

      const reviewed: Record<string, boolean> = {};
      for (const book of BOOKS) {
        const result = await hasCompletedReview(currentUser, book.id);
        console.log("Review for", book.id, ":", result);
        reviewed[book.id] = result;
      }
      setReviewedBooks(reviewed);

      const reviewsData = await getReadingReviews(currentUser);
      console.log("Reviews:", reviewsData);
      setReviews(reviewsData);
      setLoading(false);
    }).catch((err) => {
      console.error("Erreur chargement lecture:", err);
      setLoading(false);
    });
  }, []);

  function getBookStatus(bookId: string): "new" | "reading" | "done" | "reviewed" {
    const progress = progressMap[bookId];
    if (!progress) return "new";
    if (reviewedBooks[bookId]) return "reviewed";
    if (progress.completed) return "done";
    return "reading";
  }

  function isBookLocked(index: number): boolean {
    if (index === 0) return false;
    for (let i = 0; i < index; i++) {
      const status = getBookStatus(BOOKS[i].id);
      if (status !== "reviewed") return true;
    }
    return false;
  }

  if (loading) return (
    <div className="page-wrapper">
      <div className="card" style={{ textAlign: "center" }}>
        <p>⏳ Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="nav-top">
          <button className="back-btn" onClick={() => router.push("/")}>
            &larr;
          </button>
          <div className="logo" style={{ margin: 0 }}>Bibliotheque</div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.8rem",
              color: "var(--btn)",
              fontFamily: "Lato, sans-serif",
              fontWeight: "700",
            }}
          >
            {showHistory ? "Livres" : "Historique"}
          </button>
        </div>

        {/* ---- VUE : Historique ---- */}
        {showHistory && (
          <>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              Tes bilans de lecture
            </p>
            {reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <p style={{ fontSize: "2rem" }}>📚</p>
                <p style={{ color: "var(--muted)" }}>Aucun bilan pour l instant.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </>
        )}

        {/* ---- VUE : Liste livres ---- */}
        {!showHistory && (
          <>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              Choisis un livre et commence ta lecture.
            </p>

            <div style={{
              background: "var(--bg)",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              borderLeft: "3px solid #F98F0B",
            }}>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0, lineHeight: "1.5" }}>
                📌 Termine un livre + ecris ton bilan pour debloquer le suivant.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {BOOKS.map((book, index) => {
                const status = getBookStatus(book.id);
                const progress = progressMap[book.id];
                const locked = isBookLocked(index);
                const progressPercent = progress
                  ? Math.round((progress.currentChapter / book.chapters.length) * 100)
                  : 0;

                const badge = locked
                  ? { label: "🔒 Verrouille", bg: "#33333388", color: "var(--muted)" }
                  : status === "new"
                  ? { label: "Nouveau", bg: "#33333388", color: "var(--muted)" }
                  : status === "reading"
                  ? { label: `📖 ${progressPercent}%`, bg: "#F98F0B33", color: "#F98F0B" }
                  : status === "done"
                  ? { label: "✍️ A evaluer", bg: "#E74C3C33", color: "#E74C3C" }
                  : { label: "✅ Termine", bg: "#27AE6033", color: "#27AE60" };

                return (
                  <div
                    key={book.id}
                    onClick={() => {
                      if (locked) return;
                      if (status === "done") router.push(`/lecture/${book.id}/review`);
                      else router.push(`/lecture/${book.id}`);
                    }}
                    style={{
                      borderRadius: "16px",
                      padding: "1rem",
                      cursor: locked ? "not-allowed" : "pointer",
                      border: locked ? "1.5px solid var(--border)"
                        : status === "reading" ? "1.5px solid #F98F0B"
                        : status === "done" ? "1.5px solid #E74C3C"
                        : status === "reviewed" ? "1.5px solid #27AE60"
                        : "1.5px solid var(--border)",
                      background: locked ? "var(--bg)"
                        : status === "reading" ? "linear-gradient(135deg, #F98F0B0A, var(--bg))"
                        : status === "done" ? "linear-gradient(135deg, #E74C3C0A, var(--bg))"
                        : status === "reviewed" ? "linear-gradient(135deg, #27AE600A, var(--bg))"
                        : "var(--bg)",
                      opacity: locked ? 0.45 : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>

                      {/* Cover + badge */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", minWidth: "3rem" }}>
                        <div style={{ fontSize: "2.5rem", lineHeight: 1 }}>
                          {locked ? "🔒" : book.cover}
                        </div>
                        <span style={{
                          fontSize: "0.65rem",
                          fontWeight: "700",
                          padding: "0.2rem 0.45rem",
                          borderRadius: "20px",
                          background: badge.bg,
                          color: badge.color,
                          whiteSpace: "nowrap",
                          textAlign: "center",
                        }}>
                          {badge.label}
                        </span>
                      </div>

                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "1rem" }}>
                          {book.title}
                        </p>
                        <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0.2rem 0" }}>
                          {book.author}
                        </p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text)", margin: "0.3rem 0 0.5rem", lineHeight: "1.4" }}>
                          {book.description}
                        </p>

                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.72rem", background: "var(--card)", borderRadius: "20px", padding: "0.2rem 0.6rem", color: "var(--muted)" }}>
                            {book.level}
                          </span>
                          <span style={{ fontSize: "0.72rem", background: "var(--card)", borderRadius: "20px", padding: "0.2rem 0.6rem", color: "var(--muted)" }}>
                            ⏱️ ~{book.estimatedMinutes} min
                          </span>
                          <span style={{ fontSize: "0.72rem", background: "var(--card)", borderRadius: "20px", padding: "0.2rem 0.6rem", color: "var(--muted)" }}>
                            {book.chapters.length} chapitres
                          </span>
                        </div>

                        {/* Barre de progression */}
                        {status === "reading" && progress && (
                          <div style={{ marginTop: "0.75rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                              <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                                Chapitre {progress.currentChapter + 1} / {book.chapters.length}
                              </span>
                              <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "#F98F0B" }}>
                                {progressPercent}%
                              </span>
                            </div>
                            <div style={{ height: "5px", background: "var(--border)", borderRadius: "5px" }}>
                              <div style={{
                                height: "100%",
                                width: `${progressPercent}%`,
                                background: "linear-gradient(90deg, #F98F0B, #FFB347)",
                                borderRadius: "5px",
                                transition: "width 0.4s",
                              }} />
                            </div>
                          </div>
                        )}

                        {status === "done" && !locked && (
                          <div style={{ marginTop: "0.75rem", background: "#E74C3C22", borderRadius: "8px", padding: "0.5rem 0.75rem" }}>
                            <p style={{ fontSize: "0.8rem", color: "#E74C3C", margin: 0, fontWeight: "700" }}>
                              ✍️ Ecris ton resume pour debloquer le suivant !
                            </p>
                          </div>
                        )}

                        {status === "reviewed" && (
                          <div style={{ marginTop: "0.75rem", background: "#27AE6022", borderRadius: "8px", padding: "0.5rem 0.75rem" }}>
                            <p style={{ fontSize: "0.8rem", color: "#27AE60", margin: 0, fontWeight: "700" }}>
                              ✅ Livre termine et evalue
                            </p>
                          </div>
                        )}

                        {locked && (
                          <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "0.5rem 0 0", fontStyle: "italic" }}>
                            Termine le livre precedent pour debloquer
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: ReadingReview }) {
  const [showCorrection, setShowCorrection] = useState(false);
  const [showWords, setShowWords] = useState(false);

  return (
    <div style={{
      background: "var(--bg)",
      borderRadius: "16px",
      padding: "1rem",
      marginBottom: "0.75rem",
      border: "1.5px solid var(--border)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <p style={{ fontWeight: "700", color: "var(--text)", margin: 0 }}>{review.bookTitle}</p>
        <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>
          {new Date(review.timestamp).toLocaleDateString("fr-FR")}
        </p>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.4rem" }}>
          📝 Ton resume
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: "1.6", margin: 0, fontStyle: "italic" }}>
          {review.summary}
        </p>
      </div>

      {review.summaryCorrected && (
        <div style={{ marginBottom: "0.75rem" }}>
          {!showCorrection ? (
            <button
              onClick={() => setShowCorrection(true)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1.5px solid var(--btn)", background: "transparent", color: "var(--btn)", fontFamily: "Lato, sans-serif", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer" }}
            >
              ✅ Voir la correction
            </button>
          ) : (
            <div style={{ background: "var(--card)", borderRadius: "10px", padding: "0.85rem", borderLeft: "3px solid var(--btn)" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--btn)", marginBottom: "0.4rem" }}>
                ✅ Resume corrige
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: "1.6", margin: 0 }}>
                {review.summaryCorrected}
              </p>
              <button onClick={() => setShowCorrection(false)} style={{ marginTop: "0.5rem", background: "none", border: "none", color: "var(--muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "Lato, sans-serif" }}>
                Masquer
              </button>
            </div>
          )}
        </div>
      )}

      {review.wordsLearned && review.wordsLearned.length > 0 && (
        <div>
          {!showWords ? (
            <button
              onClick={() => setShowWords(true)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1.5px solid #27AE60", background: "transparent", color: "#27AE60", fontFamily: "Lato, sans-serif", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer" }}
            >
              📚 Voir les mots appris
            </button>
          ) : (
            <div style={{ background: "var(--card)", borderRadius: "10px", padding: "0.85rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#27AE60", marginBottom: "0.5rem" }}>
                📚 Mots appris
              </p>
              {review.wordsLearned.map((w, i) => (
                <div key={i} style={{ marginBottom: i < review.wordsLearned.length - 1 ? "0.5rem" : 0 }}>
                  <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.88rem" }}>{w.word}</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "0.1rem 0 0", fontStyle: "italic" }}>{w.definition}</p>
                </div>
              ))}
              <button onClick={() => setShowWords(false)} style={{ marginTop: "0.5rem", background: "none", border: "none", color: "var(--muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "Lato, sans-serif" }}>
                Masquer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}