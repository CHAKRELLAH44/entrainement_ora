"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getReadingReviews } from "@/lib/reading-storage";
import { ReadingReview } from "@/types/books";

function ReviewCard({ review }: { review: ReadingReview }) {
  const [showSummary, setShowSummary] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);

  return (
    <div className="session-item">
      <div className="session-meta">
        <span className="session-date">{new Date(review.timestamp).toLocaleDateString("fr-FR")}</span>
        <span className="session-type">Lecture</span>
      </div>
      <div className="session-topic">📖 {review.bookTitle}</div>

      {/* Mots appris */}
      {review.wordsLearned && review.wordsLearned.length > 0 && (
        <div style={{ marginTop: "0.75rem" }}>
          <p className="audio-label">📚 Mots appris</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem" }}>
            {review.wordsLearned.map((word, index) => (
              <div key={index} style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0.4rem 0.6rem",
                fontSize: "0.8rem"
              }}>
                <strong>{word.word}</strong>: {word.definition}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résumé */}
      {review.summary && (
        <div style={{ marginTop: "1rem" }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowSummary(!showSummary)}
            style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
          >
            {showSummary ? "Masquer" : "Voir"} mon résumé
          </button>
          {showSummary && (
            <div style={{
              background: "var(--bg)",
              border: "1.5px solid var(--border)",
              borderRadius: "12px",
              padding: "1rem",
              marginTop: "0.5rem",
              whiteSpace: "pre-wrap",
              fontSize: "0.9rem"
            }}>
              {review.summary}
            </div>
          )}
        </div>
      )}

      {/* Correction IA */}
      {review.summaryCorrected && (
        <div style={{ marginTop: "1rem" }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowCorrection(!showCorrection)}
            style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
          >
            {showCorrection ? "Masquer" : "Voir"} la correction IA
          </button>
          {showCorrection && (
            <div style={{
              background: "var(--bg)",
              border: "1.5px solid var(--border)",
              borderRadius: "12px",
              padding: "1rem",
              marginTop: "0.5rem",
              whiteSpace: "pre-wrap",
              fontSize: "0.9rem"
            }}>
              {review.summaryCorrected}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoriqueLecturePage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReadingReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);

    // Charger les reviews de lecture
    getReadingReviews(currentUser).then(reviews => {
      console.log("Reviews de lecture:", reviews);
      setReviews(reviews);
      setLoading(false);
    }).catch(error => {
      console.error("Erreur lors du chargement des reviews:", error);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="card">
          <h2>Chargement...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="card">
        <div className="nav-top">
          <button className="back-btn" onClick={() => router.push("/")}>
            &larr;
          </button>
          <div className="chip">Historique de lecture</div>
          <div style={{ width: 24 }} />
        </div>

        <h2>Mes lectures terminées</h2>

        {reviews.length === 0 ? (
          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
            <p style={{ color: "var(--muted)" }}>
              Aucune lecture terminée pour le moment. Commence par lire un livre !
            </p>
            <button
              className="btn"
              onClick={() => router.push("/lecture")}
              style={{ marginTop: "1rem" }}
            >
              Commencer à lire
            </button>
          </div>
        ) : (
          <div className="sessions-list">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}