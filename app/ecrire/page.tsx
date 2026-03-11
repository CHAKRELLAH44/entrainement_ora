"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EcrireIntroPage() {
  const [page, setPage] = useState<1 | 2>(1);
  const router = useRouter();

  return (
    <div className="page-wrapper">
      <div className="card">

        {/* ---- PAGE 1 : Rules ---- */}
        {page === 1 && (
          <>
            <div className="nav-top">
              <button className="back-btn" onClick={() => router.push("/")}>
                &larr;
              </button>
              <div className="chip">1 / 2</div>
              <div style={{ width: 24 }} />
            </div>

            <h2>Règles pour commencer cette session d'écriture</h2>

            <ul className="tip-list">
              <li>
                <div className="tip-icon">🤲</div>
                <div><strong>BESMILAH</strong></div>
              </li>
              <li>
                <div className="tip-icon">🎲</div>
                <div>
                  <strong>Sujet aléatoire</strong> qui te sera choisi, à toi de voir ce qui sort.
                </div>
              </li>
              <li>
                <div className="tip-icon">✍️</div>
                <div>
                  <strong>Écris au minimum 100 mots</strong> pour exprimer ton point de vue sur le sujet.
                </div>
              </li>
            </ul>

            <button className="btn" onClick={() => setPage(2)} style={{ marginTop: "2rem" }}>
              Suivant
            </button>
          </>
        )}

        {/* ---- PAGE 2 : Start ---- */}
        {page === 2 && (
          <>
            <div className="nav-top">
              <button className="back-btn" onClick={() => setPage(1)}>
                &larr;
              </button>
              <div className="chip">2 / 2</div>
              <div style={{ width: 24 }} />
            </div>

            <h2>Prêt à écrire ?</h2>

            <div style={{ textAlign: "center", margin: "2rem 0" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✍️</div>
              <p style={{ color: "var(--muted)" }}>
                Clique sur "Lancer le dé" pour obtenir ton sujet aléatoire et commencer à écrire.
              </p>
            </div>

            <button className="btn" onClick={() => router.push("/ecrire/session")} style={{ marginTop: "2rem" }}>
              Lancer le dé
            </button>
          </>
        )}

      </div>
    </div>
  );
}