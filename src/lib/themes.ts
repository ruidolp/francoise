export const THEMES = [
  { id: "natural", label: "Natural",  emoji: "🌿" },
  { id: "oceano",  label: "Océano",   emoji: "🌊" },
  { id: "calido",  label: "Cálido",   emoji: "🍊" },
] as const

export type ThemeId = typeof THEMES[number]["id"]
export const DEFAULT_THEME: ThemeId = "calido"
