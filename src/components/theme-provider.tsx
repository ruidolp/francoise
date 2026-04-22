"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { DEFAULT_THEME, ThemeId } from "@/lib/themes"

const ThemeContext = createContext<{
  theme: ThemeId
  setTheme: (t: ThemeId) => void
}>({ theme: DEFAULT_THEME, setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME)

  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeId | null
    const active = saved ?? DEFAULT_THEME
    setThemeState(active)
    document.documentElement.setAttribute("data-theme", active)
  }, [])

  function setTheme(t: ThemeId) {
    setThemeState(t)
    localStorage.setItem("theme", t)
    document.documentElement.setAttribute("data-theme", t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
