"use client"

import { useTheme } from "@/components/theme-provider"
import { THEMES } from "@/lib/themes"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Palette } from "lucide-react"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <Sheet>
      <SheetTrigger className="p-2 rounded-xl" style={{ color: "var(--muted-foreground)" }}>
        <Palette size={20} />
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pt-4 pb-8"
        style={{ background: "var(--card)", color: "var(--card-foreground)" }}>
        <SheetHeader className="mb-4">
          <SheetTitle style={{ color: "var(--foreground)" }}>Elige un tema</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
              style={{
                background: theme === t.id ? "var(--secondary)" : "var(--muted)",
                border: theme === t.id ? "2px solid var(--primary)" : "2px solid transparent",
              }}>
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{t.label}</span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
