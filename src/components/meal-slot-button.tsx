"use client"

import { CheckCircle, Plus, X } from "lucide-react"

interface SlotDish {
  dish_id: number
  dish_name: string
  dish_verified: boolean | null
}

interface Props {
  dishes: SlotDish[]
  onClick: () => void
  onRemove: (dishId: number) => void
}

export function MealSlotButton({ dishes, onClick, onRemove }: Props) {
  if (dishes.length === 0) {
    return (
      <button onClick={onClick}
        className="w-full min-h-10 rounded-lg flex items-center justify-center text-xs transition-colors"
        style={{ background: "var(--slot-empty)", color: "var(--muted-foreground)", border: "1px dashed var(--border)" }}>
        <Plus size={14} />
      </button>
    )
  }

  return (
    <div className="w-full rounded-lg overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "var(--slot-filled)" }}>
      {dishes.map((d, i) => (
        <div key={d.dish_id}
          className="flex items-center gap-1 px-2 py-1.5"
          style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}>
          {d.dish_verified && <CheckCircle size={10} style={{ color: "var(--verified)", flexShrink: 0 }} />}
          <span className="flex-1 text-[11px] font-medium leading-tight truncate"
            style={{ color: "var(--foreground)" }}>
            {d.dish_name}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onRemove(d.dish_id) }}
            className="flex-shrink-0 p-0.5 rounded"
            style={{ color: "var(--muted-foreground)" }}>
            <X size={11} />
          </button>
        </div>
      ))}
      <button onClick={onClick}
        className="w-full flex items-center justify-center gap-1 py-1 text-[10px] transition-colors"
        style={{
          borderTop: "1px dashed var(--border)",
          color: "var(--muted-foreground)",
          background: "var(--slot-empty)",
        }}>
        <Plus size={10} />
        <span>añadir</span>
      </button>
    </div>
  )
}
