"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { CheckCircle, X, Search, Plus, Loader2, ChevronLeft } from "lucide-react"
import { getDishes } from "@/lib/actions/dishes"
import type { Dish } from "@/lib/db/types"

interface SlotDish {
  dish_id: number
  dish_name: string
  dish_verified: boolean | null
}

interface Props {
  open: boolean
  onClose: () => void
  title: string
  selectedDishes: SlotDish[]
  onAdd: (dish: Dish) => void
  onRemove: (dishId: number) => void
}

export function DishPickerSheet({ open, onClose, title, selectedDishes, onAdd, onRemove }: Props) {
  const [search, setSearch] = useState("")
  const [dishes, setDishes] = useState<Dish[]>([])
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) { setSearch(""); return }
    setTimeout(() => inputRef.current?.focus(), 100)
    startTransition(async () => setDishes(await getDishes()))
  }, [open])

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => setDishes(await getDishes(search)))
    }, 200)
    return () => clearTimeout(timer)
  }, [search])

  const selectedIds = new Set(selectedDishes.map(d => d.dish_id))
  const filteredDishes = dishes.filter(d => !selectedIds.has(d.id))
  const exactMatch = dishes.some(d => d.name.toLowerCase() === search.trim().toLowerCase())

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl p-0 flex flex-col"
        style={{ height: "80vh", background: "var(--background)", color: "var(--foreground)" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <button onClick={onClose} className="p-1 rounded-lg"
            style={{ color: "var(--muted-foreground)" }}>
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium capitalize" style={{ color: "var(--muted-foreground)" }}>
              Planificando
            </p>
            <p className="text-base font-bold capitalize" style={{ color: "var(--foreground)" }}>
              {title}
            </p>
          </div>
        </div>

        {/* Platos ya añadidos */}
        {selectedDishes.length > 0 && (
          <div className="px-4 pt-3 pb-2 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
              EN ESTE SLOT
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDishes.map(d => (
                <div key={d.dish_id}
                  className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                  {d.dish_verified && <CheckCircle size={13} style={{ color: "var(--verified)" }} />}
                  <span className="max-w-[140px] truncate">{d.dish_name}</span>
                  <button onClick={() => onRemove(d.dish_id)}
                    className="ml-0.5 p-0.5 rounded-full transition-colors"
                    style={{ color: "var(--muted-foreground)" }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buscador */}
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
            <Search size={15} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
            <input
              ref={inputRef}
              placeholder="Buscar plato..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ color: "var(--muted-foreground)" }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {pending && (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
            </div>
          )}

          {!pending && (
            <div className="space-y-1.5">
              {/* Opción crear si no hay match exacto */}
              {search.trim() && !exactMatch && (
                <button
                  onClick={() => {/* crear plato desde aquí requeriría más lógica, dejamos esto por ahora */}}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
                  style={{ background: "var(--muted)", border: "1px dashed var(--primary)", color: "var(--primary)" }}>
                  <Plus size={16} />
                  <span className="text-sm font-medium">Crear «{search.trim()}»</span>
                </button>
              )}

              {filteredDishes.map(dish => (
                <button key={dish.id}
                  onClick={() => { onAdd(dish) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors active:scale-[0.98]"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="w-5 flex-shrink-0 flex justify-center">
                    {dish.verified
                      ? <CheckCircle size={16} style={{ color: "var(--verified)" }} />
                      : <div className="w-4 h-4 rounded-full" style={{ border: "1.5px solid var(--border)" }} />
                    }
                  </div>
                  <span className="flex-1 text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {dish.name}
                  </span>
                  <Plus size={15} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                </button>
              ))}

              {filteredDishes.length === 0 && !search.trim() && selectedDishes.length > 0 && (
                <p className="text-center text-sm py-6" style={{ color: "var(--muted-foreground)" }}>
                  Todos los platos ya están añadidos
                </p>
              )}

              {filteredDishes.length === 0 && !search.trim() && selectedDishes.length === 0 && (
                <p className="text-center text-sm py-6" style={{ color: "var(--muted-foreground)" }}>
                  No hay platos. Ve a «Mis Platos» para crear uno.
                </p>
              )}

              {filteredDishes.length === 0 && search.trim() && exactMatch && (
                <p className="text-center text-sm py-6" style={{ color: "var(--muted-foreground)" }}>
                  {`«${search}» ya está en la lista`}
                </p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
