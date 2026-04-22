"use client"

import { CheckCircle, Plus, X } from "lucide-react"

interface Props {
  dishName?: string | null
  verified?: boolean | null
  onClick: () => void
  onClear?: () => void
}

export function MealSlotButton({ dishName, verified, onClick, onClear }: Props) {
  if (!dishName) {
    return (
      <button onClick={onClick}
        className="w-full h-10 rounded-lg flex items-center justify-center text-xs transition-colors"
        style={{ background: "var(--slot-empty)", color: "var(--muted-foreground)", border: "1px dashed var(--border)" }}>
        <Plus size={14} />
      </button>
    )
  }

  return (
    <div className="relative w-full">
      <button onClick={onClick}
        className="w-full h-10 rounded-lg px-2 pr-7 flex items-center gap-1 text-xs font-medium text-left transition-colors"
        style={{ background: "var(--slot-filled)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
        {verified && <CheckCircle size={12} style={{ color: "var(--verified)", flexShrink: 0 }} />}
        <span className="truncate">{dishName}</span>
      </button>
      {onClear && (
        <button onClick={e => { e.stopPropagation(); onClear() }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-0.5"
          style={{ color: "var(--muted-foreground)" }}>
          <X size={12} />
        </button>
      )}
    </div>
  )
}
