"use client";

import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="page-wrapper">
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "4rem", margin: "1rem 0" }}>🎉</div>
        <h2>Bravo !</h2>
        <p style={{ color: "var(--muted)", lineHeight: "1.6" }}>
          Tu as termine ta lecture et soumis ton bilan. Tu peux maintenant choisir un nouveau livre !
        </p>
        <button className="btn" onClick={() => router.push("/lecture")}>
          Choisir un autre livre
        </button>
        <button className="btn btn-ghost" onClick={() => router.push("/")}>
          Retour a l accueil
        </button>
      </div>
    </div>
  );
}