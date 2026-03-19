const THEMES_KEY = "userThemes";

export type Theme = "tech" | "sport" | "philosophie" | "societe" | "amour" | "culture";

export const ALL_THEMES: { code: Theme; label: string; emoji: string }[] = [
  { code: "tech", label: "Tech", emoji: "💻" },
  { code: "sport", label: "Sport", emoji: "⚽" },
  { code: "philosophie", label: "Philosophie", emoji: "🧠" },
  { code: "societe", label: "Société", emoji: "🌍" },
  { code: "amour", label: "Amour & Relations", emoji: "❤️" },
  { code: "culture", label: "Culture", emoji: "🎭" },
];

export function getUserThemes(): Theme[] {
  if (typeof window === "undefined") return ALL_THEMES.map((t) => t.code);
  const saved = localStorage.getItem(THEMES_KEY);
  if (!saved) return ALL_THEMES.map((t) => t.code);
  return JSON.parse(saved);
}

export function setUserThemes(themes: Theme[]): void {
  localStorage.setItem(THEMES_KEY, JSON.stringify(themes));
}