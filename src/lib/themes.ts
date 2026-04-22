export const THEMES = [
  { id: "clasico", label: "Clásico",  emoji: "🖤" },
  { id: "sol",     label: "Sol",      emoji: "☀️" },
  { id: "calido",  label: "Cálido",   emoji: "🍊" },
] as const

export type ThemeId = typeof THEMES[number]["id"]
export const DEFAULT_THEME: ThemeId = "calido"
