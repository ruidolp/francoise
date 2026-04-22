"use client"

import { useState, useEffect, useTransition } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle, Plus, Loader2 } from "lucide-react"
import { getDishes, createDish } from "@/lib/actions/dishes"
import type { Dish } from "@/lib/db/types"

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (dish: Dish) => void
  title: string
}

export function DishPickerSheet({ open, onClose, onSelect, title }: Props) {
  const [search, setSearch] = useState("")
  const [dishes, setDishes] = useState<Dish[]>([])
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) { setSearch(""); return }
    startTransition(async () => {
      const results = await getDishes()
      setDishes(results)
    })
  }, [open])

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => {
        const results = await getDishes(search)
        setDishes(results)
      })
    }, 250)
    return () => clearTimeout(timer)
  }, [search])

  async function handleCreate() {
    if (!search.trim()) return
    startTransition(async () => {
      const dish = await createDish(search.trim())
      onSelect(dish)
      onClose()
    })
  }

  const exactMatch = dishes.some(d => d.name.toLowerCase() === search.trim().toLowerCase())

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl px-4 pt-4"
        style={{ background: "var(--card)", color: "var(--card-foreground)" }}>
        <SheetHeader className="mb-3">
          <SheetTitle style={{ color: "var(--foreground)" }}>{title}</SheetTitle>
        </SheetHeader>

        <Input
          autoFocus
          placeholder="Buscar o crear plato..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-3"
          style={{ borderColor: "var(--border)", background: "var(--muted)" }}
        />

        <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 140px)" }}>
          {pending && (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
            </div>
          )}

          {!pending && search.trim() && !exactMatch && (
            <button onClick={handleCreate}
              className="w-full flex items-center gap-2 p-3 rounded-xl mb-1 text-sm font-medium text-left"
              style={{ background: "var(--muted)", color: "var(--primary)", border: "1px dashed var(--border)" }}>
              <Plus size={16} />
              Crear «{search.trim()}»
            </button>
          )}

          {!pending && dishes.map(dish => (
            <button key={dish.id} onClick={() => { onSelect(dish); onClose() }}
              className="w-full flex items-center gap-2 p-3 rounded-xl mb-1 text-sm text-left transition-colors"
              style={{ background: "var(--muted)", color: "var(--foreground)" }}>
              {dish.verified && <CheckCircle size={14} style={{ color: "var(--verified)", flexShrink: 0 }} />}
              <span>{dish.name}</span>
            </button>
          ))}

          {!pending && dishes.length === 0 && !search.trim() && (
            <p className="text-center text-sm py-8" style={{ color: "var(--muted-foreground)" }}>
              No hay platos. Escribe para crear uno.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
