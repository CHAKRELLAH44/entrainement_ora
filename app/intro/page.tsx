"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IntroPage() {
  const [page, setPage] = useState<1 | 2 | 3>(1);
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
              <div className="chip">1 / 3</div>
              <div style={{ width: 24 }} />
            </div>

            <h2>Rules diali bach tebda had session</h2>

            <ul className="tip-list">
              <li>
                <div className="tip-icon">🤲</div>
                <div><strong>BESMILAH</strong></div>
              </li>
              <li>
                <div className="tip-icon">🎲</div>
                <div>
                  <strong>Sujet aleatoire</strong> li khtarit lik , nta o zehrek chno yetle3 .
                </div>
              </li>
              <li>
                <div className="tip-icon">🧠</div>
                <div>
                  <strong>60 secondes</strong> bach tfeker chno tgol — organise
                  Afkarek.
                </div>
              </li>
              <li>
                <div className="tip-icon">🎙️</div>
                <div>
                  <strong>60 secondes</strong> bach tehder + 3eber kif bghiit.
                  Dakchi hay koun enregistre.
                </div>
              </li>
            </ul>

            <button className="btn" onClick={() => setPage(2)}>
              Suivant &rarr;
            </button>
            <button className="btn btn-ghost" onClick={() => router.push("/")}>
              Retour
            </button>
          </>
        )}

        {/* ---- PAGE 2 : Message Binomtek ---- */}
        {page === 2 && (
          <>
            <div className="nav-top">
              <button className="back-btn" onClick={() => setPage(1)}>
                &larr;
              </button>
              <div className="chip">2 / 3</div>
              <div style={{ width: 24 }} />
            </div>

            <h2>Message from Binomtek</h2>

            <ul className="tip-list">
              <li>
                <div className="tip-icon">🗣️</div>
                <div>
                  Parle <strong>spontanement</strong>, Li jak f3e9lek golo.
                </div>
              </li>
              <li>
                <div className="tip-icon">🌱</div>
                <div>
                  Ne cherche pas la <strong>perfection</strong>. Lmhm houwa
                  tehder hadchi hat chofo hir bohdek.
                </div>
              </li>
              <li>
                <div className="tip-icon">💪</div>
                <div>
                  Dert jehd bach sayebt hadchi —{" "}
                  <strong>dir tanta chi haja</strong>.
                </div>
              </li>
            </ul>

            <button className="btn" onClick={() => setPage(3)}>
              Suivant &rarr;
            </button>
            <button className="btn btn-ghost" onClick={() => setPage(1)}>
              Retour
            </button>
          </>
        )}

        {/* ---- PAGE 3 : Have Fun ---- */}
        {page === 3 && (
          <>
            <div className="nav-top">
              <button className="back-btn" onClick={() => setPage(2)}>
                &larr;
              </button>
              <div className="chip">3 / 3</div>
              <div style={{ width: 24 }} />
            </div>

            <div style={{
              textAlign: "center",
              padding: "2rem 0",
            }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "3rem",
                fontWeight: "700",
                color: "var(--btn)",
                lineHeight: "1.1",
                marginBottom: "0.5rem",
              }}>
                Have Fun
              </div>
              <p style={{
                fontSize: "1rem",
                color: "var(--muted)",
                marginTop: "0.75rem",
              }}>
                C est parti, fais de ton mieux !
              </p>
            </div>

            <button
              className="btn"
              onClick={() => router.push("/session")}
              style={{ fontSize: "1.1rem", padding: "1.1rem" }}
            >
              Commencer la seance 🚀
            </button>
            <button className="btn btn-ghost" onClick={() => setPage(2)}>
              Retour
            </button>
          </>
        )}

      </div>
    </div>
  );
}