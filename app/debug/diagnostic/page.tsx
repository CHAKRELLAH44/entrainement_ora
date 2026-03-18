"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { diagnoseExpressionTable } from "@/lib/storage";

export default function DiagnosticPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        console.log("🔍 Lancement du diagnostic...");
        const result = await diagnoseExpressionTable();
        console.log("Résultat du diagnostic:", result);
        setResult(result);
      } catch (err) {
        console.error("Erreur diagnostic:", err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    runDiagnostic();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="card">
        <Link href="/" style={{ color: "var(--btn)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "1.5rem" }}>
          ← Retour
        </Link>

        <h1>🔍 Diagnostic Supabase</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          Vérification de la table expression_sessions
        </p>

        {loading && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</p>
            <p>Diagnostic en cours...</p>
          </div>
        )}

        {error && (
          <div style={{ background: "#E74C3C22", border: "1.5px solid #E74C3C", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
            <p style={{ fontWeight: "700", color: "#E74C3C", margin: "0 0 0.5rem 0" }}>❌ Erreur</p>
            <pre style={{
              background: "var(--card)",
              border: "1.5px solid var(--border)",
              borderRadius: "8px",
              padding: "1rem",
              overflow: "auto",
              fontSize: "0.8rem",
              margin: 0,
              color: "var(--text)"
            }}>
              {error}
            </pre>
          </div>
        )}

        {result && (
          <div>
            {result.message === "✅ Tous les tests sont OK" ? (
              <div style={{ background: "#27AE6022", border: "1.5px solid #27AE60", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
                <p style={{ fontWeight: "700", color: "#27AE60", margin: 0 }}>✅ {result.message}</p>
              </div>
            ) : (
              <div style={{ background: "#E74C3C22", border: "1.5px solid #E74C3C", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
                <p style={{ fontWeight: "700", color: "#E74C3C", margin: "0 0 1rem 0" }}>⚠️ Problèmes détectés</p>
                
                {result.tableExists === false && (
                  <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "var(--bg)", borderRadius: "8px" }}>
                    <p style={{ fontWeight: "700", margin: "0 0 0.5rem 0" }}>❌ Table n'existe pas</p>
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: 0 }}>
                      Créez la table selon les instructions dans <strong>FIX_SUPABASE_403.md</strong>
                    </p>
                  </div>
                )}

                {result.readError && (
                  <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "var(--bg)", borderRadius: "8px" }}>
                    <p style={{ fontWeight: "700", margin: "0 0 0.5rem 0" }}>❌ Erreur Lecture</p>
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: 0, fontFamily: "monospace" }}>
                      {result.readError}
                    </p>
                  </div>
                )}

                {result.insertError && (
                  <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "var(--bg)", borderRadius: "8px" }}>
                    <p style={{ fontWeight: "700", margin: "0 0 0.5rem 0" }}>❌ Erreur Insert</p>
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: 0, fontFamily: "monospace" }}>
                      {result.insertError}
                    </p>
                    {result.code && (
                      <p style={{ color: "var(--muted)", fontSize: "0.75rem", margin: "0.5rem 0 0 0" }}>
                        Code: <strong>{result.code}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={{ background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
              <p style={{ fontWeight: "700", marginBottom: "0.5rem" }}>Résultat complet:</p>
              <pre style={{
                background: "var(--card)",
                border: "1.5px solid var(--border)",
                borderRadius: "8px",
                padding: "1rem",
                overflow: "auto",
                fontSize: "0.8rem",
                margin: 0,
                color: "var(--text)"
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "linear-gradient(135deg, #3498DB22, #3498DB11)", border: "1.5px solid #3498DB", borderRadius: "12px" }}>
          <p style={{ fontWeight: "700", color: "#3498DB", margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>💡 Si le diagnostic échoue:</p>
          <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "var(--muted)", fontSize: "0.85rem", lineHeight: "1.6" }}>
            <li>Ouvrez <strong>FIX_SUPABASE_403.md</strong></li>
            <li>Suivez les étapes Supabase SQL Editor</li>
            <li>Rafraîchissez la page pour relancer le diagnostic</li>
          </ul>
        </div>

        <Link href="/" style={{ display: "block", textAlign: "center", color: "var(--btn)", textDecoration: "none", fontSize: "0.85rem", fontWeight: "700", marginTop: "1.5rem" }}>
          ← Retour
        </Link>
      </div>
    </div>
  );
}
