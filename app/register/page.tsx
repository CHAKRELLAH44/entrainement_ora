"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setCurrentUser } from "@/lib/storage";
import { setUserLang, getLangFlag, getLangLabel, Lang } from "@/lib/i18n";

const LANGUAGES: { code: Lang; label: string; flag: string; sub: string }[] = [
  { code: "fr", label: "Francais", flag: "🇫🇷", sub: "Je veux parler francais" },
  { code: "en", label: "English", flag: "🇬🇧", sub: "I want to speak English" },
  { code: "es", label: "Espanol", flag: "🇪🇸", sub: "Quiero hablar espanol" },
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"check" | "form" | "invalid">("check");
  const [nickname, setNickname] = useState("");
  const [selectedLang, setSelectedLang] = useState<Lang>("fr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const validCode = process.env.NEXT_PUBLIC_INVITE_CODE;
    if (code === validCode) {
      setStep("form");
    } else {
      setStep("invalid");
    }
  }, []);

  async function handleRegister() {
    if (!nickname.trim()) return;
    setLoading(true);
    setError("");

    const clean = nickname.trim().toLowerCase();

    // Vérifier si nickname déjà pris
    const { data } = await supabase
      .from("allowed_users")
      .select("nickname")
      .ilike("nickname", clean)
      .single();

    if (data) {
      setError("Ce nickname est déjà pris. Choisis-en un autre !");
      setLoading(false);
      return;
    }

    // Créer le nickname
    const { error: insertError } = await supabase
      .from("allowed_users")
      .insert([{ nickname: clean }]);

    if (insertError) {
      setError("Erreur lors de la création. Réessaie.");
      setLoading(false);
      return;
    }

    // Connecter directement
    setCurrentUser(clean);
    setUserLang(selectedLang);
    setLoading(false);
    router.push("/");
  }

  // Lien invalide
  if (step === "invalid") {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
          <h2>Lien invalide</h2>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
            Ce lien d invitation n est pas valide ou a expiré.
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            Demande un nouveau lien a l administrateur.
          </p>
          <button
            className="btn btn-ghost"
            style={{ marginTop: "1rem" }}
            onClick={() => router.push("/login")}
          >
            Retour connexion
          </button>
        </div>
      </div>
    );
  }

  // Chargement vérification
  if (step === "check") {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: "center" }}>
          <p>⏳ Vérification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="card" style={{ textAlign: "center" }}>
        <div className="logo">🎙️ BlaBlа Gym</div>

        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👋</div>
        <h2 style={{ marginBottom: "0.25rem" }}>Créer mon compte</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
          Choisis ton nickname 
        </p>

        {/* Nickname */}
        <input
          type="text"
          placeholder="Ton nickname..."
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          maxLength={20}
          style={{
            width: "100%",
            padding: "0.9rem 1rem",
            borderRadius: "12px",
            border: "1.5px solid var(--border)",
            background: "var(--bg)",
            color: "var(--text)",
            fontFamily: "Lato, sans-serif",
            fontSize: "1rem",
            outline: "none",
            marginBottom: "0.75rem",
            boxSizing: "border-box",
            textAlign: "center",
          }}
        />

        {error && (
          <p style={{ color: "#E74C3C", fontSize: "0.85rem", marginBottom: "0.75rem", fontWeight: "700" }}>
            ⚠️ {error}
          </p>
        )}

        
        

        <button
          className="btn"
          onClick={handleRegister}
          disabled={!nickname.trim() || loading}
          style={{ opacity: nickname.trim() && !loading ? 1 : 0.5 }}
        >
          {loading ? "⏳ Création..." : "Créer mon compte 🚀"}
        </button>

        <button
          className="btn btn-ghost"
          style={{ marginTop: "0.5rem" }}
          onClick={() => router.push("/login")}
        >
          J'ai déjà un compte
        </button>
      </div>
    </div>
  );
}