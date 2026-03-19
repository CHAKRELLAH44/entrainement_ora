"use client";

import { useState } from "react";
import { ALL_THEMES, Theme, getUserThemes, setUserThemes } from "@/lib/themes-storage";

export default function ThemePicker({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<Theme[]>(getUserThemes());

  function toggle(theme: Theme) {
    setSelected((prev) =>
      prev.includes(theme)
        ? prev.length > 1 ? prev.filter((t) => t !== theme) : prev
        : [...prev, theme]
    );
  }

  function save() {
    setUserThemes(selected);
    onClose();
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000088",
      zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div style={{
        background: "var(--card)", borderRadius: "24px 24px 0 0",
        padding: "1.5rem", width: "100%", maxWidth: "480px",
        boxShadow: "0 -8px 32px #00000044",
      }}>
        <p style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--text)", margin: "0 0 0.25rem" }}>
          🎯 Tes thèmes
        </p>
        <p style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "0 0 1.25rem" }}>
          Les sujets seront tirés uniquement de tes thèmes choisis
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "1.25rem" }}>
          {ALL_THEMES.map((theme) => {
            const active = selected.includes(theme.code);
            return (
              <div
                key={theme.code}
                onClick={() => toggle(theme.code)}
                style={{
                  borderRadius: "14px",
                  padding: "0.85rem 1rem",
                  border: active ? "2px solid var(--btn)" : "1.5px solid var(--border)",
                  background: active ? "linear-gradient(135deg, #F98F0B22, #F98F0B11)" : "var(--bg)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>{theme.emoji}</span>
                <div>
                  <p style={{ fontWeight: "700", color: "var(--text)", margin: 0, fontSize: "0.85rem" }}>
                    {theme.label}
                  </p>
                  {active && (
                    <p style={{ fontSize: "0.68rem", color: "var(--btn)", margin: "0.1rem 0 0", fontWeight: "700" }}>
                      ✓ Actif
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={save}
          style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", border: "none", background: "var(--btn)", color: "#fff", fontFamily: "Lato, sans-serif", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer", marginBottom: "0.5rem" }}
        >
          Sauvegarder ✓
        </button>
        <button
          onClick={onClose}
          style={{ width: "100%", padding: "0.7rem", borderRadius: "12px", border: "1.5px solid var(--border)", background: "transparent", color: "var(--muted)", fontFamily: "Lato, sans-serif", fontSize: "0.85rem", cursor: "pointer" }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}