"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { CheckCircle, X, Search, Plus, Loader2, ChevronLeft, ChevronDown, ChevronRight } from "lucide-react"
import { getDishes } from "@/lib/actions/dishes"
import type { Dish, DishCategory, MealSection } from "@/lib/db/types"
import { DISH_CATEGORIES } from "@/lib/db/types"
import type { MealType } from "@/lib/utils/week"

interface SlotDish {
  dish_id: number
  dish_name: string
  dish_verified: boolean | null
}

interface Props {
  open: boolean
  onClose: () => void
  title: string
  meal: MealType | null
  selectedDishes: SlotDish[]
  onAdd: (dish: Dish) => void
  onRemove: (dishId: number) => void
}

const MEAL_SECTION_MAP: Record<MealType, MealSection> = {
  desayuno: "DESAYUNO",
  almuerzo: "ALMUERZO",
  cena:     "CENA",
}

export function DishPickerSheet({ open, onClose, title, meal, selectedDishes, onAdd, onRemove }: Props) {
  const [search, setSearch] = useState("")
  const [dishes, setDishes] = useState<Dish[]>([])
  const [pending, startTransition] = useTransition()
  const [expandedCategory, setExpandedCategory] = useState<DishCategory | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) { setSearch(""); setExpandedCategory(null); return }
    setTimeout(() => inputRef.current?.focus(), 100)
    startTransition(async () => setDishes(await getDishes()))
  }, [open])

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => setDishes(await getDishes(search)))
    }, 200)
    return () => clearTimeout(timer)
  }, [search])

  function toggleCategory(cat: DishCategory) {
    setExpandedCategory(prev => prev === cat ? null : cat)
  }

  const selectedIds = new Set(selectedDishes.map(d => d.dish_id))
  const mealSection = meal ? MEAL_SECTION_MAP[meal] : null

  // Filtrar: excluir ya seleccionados, luego filtrar por sección de comida
  const filteredDishes = dishes.filter(d => {
    if (selectedIds.has(d.id)) return false
    if (!mealSection) return true
    const sections: MealSection[] = Array.isArray(d.meal_sections) ? d.meal_sections : []
    return sections.length === 0 || sections.includes(mealSection)
  })

  const exactMatch = dishes.some(d => d.name.toLowerCase() === search.trim().toLowerCase())
  const isSearching = search.trim().length > 0

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
            <div className="space-y-2">
              {/* Opción crear si no hay match exacto */}
              {isSearching && !exactMatch && (
                <button
                  onClick={() => {}}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
                  style={{ background: "var(--muted)", border: "1px dashed var(--primary)", color: "var(--primary)" }}>
                  <Plus size={16} />
                  <span className="text-sm font-medium">Crear «{search.trim()}»</span>
                </button>
              )}

              {/* Búsqueda activa: lista plana */}
              {isSearching && filteredDishes.map(dish => (
                <button key={dish.id}
                  onClick={() => onAdd(dish)}
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

              {/* Sin búsqueda: agrupado por categoría */}
              {!isSearching && DISH_CATEGORIES.map(cat => {
                const group = filteredDishes.filter(d => d.category === cat.value)
                if (group.length === 0) return null
                const expanded = expandedCategory === cat.value
                return (
                  <div key={cat.value} className="rounded-xl overflow-hidden"
                    style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
                    <button
                      onClick={() => toggleCategory(cat.value)}
                      className="w-full flex items-center gap-3 px-3 py-3 text-left transition-colors"
                      style={{ background: expanded ? "color-mix(in srgb, var(--primary) 10%, var(--card))" : "var(--card)" }}>
                      {expanded
                        ? <ChevronDown size={16} style={{ color: expanded ? "var(--primary)" : "var(--muted-foreground)", flexShrink: 0 }} />
                        : <ChevronRight size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                      }
                      <span className="flex-1 text-sm font-semibold" style={{ color: expanded ? "var(--primary)" : "var(--foreground)" }}>
                        {cat.label}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                        {group.length}
                      </span>
                    </button>

                    {expanded && (
                      <div style={{ borderTop: "1px solid var(--border)" }}>
                        {group.map((dish, idx) => (
                          <button
                            key={dish.id}
                            onClick={() => onAdd(dish)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors active:scale-[0.98]"
                            style={{
                              background: "var(--card)",
                              borderTop: idx > 0 ? "1px solid var(--border)" : undefined,
                            }}>
                            <div className="w-5 flex-shrink-0 flex justify-center">
                              {dish.verified
                                ? <CheckCircle size={15} style={{ color: "var(--verified)" }} />
                                : <div className="w-[15px] h-[15px] rounded-full" style={{ border: "1.5px solid var(--border)" }} />
                              }
                            </div>
                            <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                              {dish.name}
                            </span>
                            <Plus size={15} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Mensajes de vacío */}
              {filteredDishes.length === 0 && !isSearching && selectedDishes.length > 0 && (
                <p className="text-center text-sm py-6" style={{ color: "var(--muted-foreground)" }}>
                  Todos los platos ya están añadidos
                </p>
              )}
              {filteredDishes.length === 0 && !isSearching && selectedDishes.length === 0 && (
                <p className="text-center text-sm py-6" style={{ color: "var(--muted-foreground)" }}>
                  No hay platos. Ve a «Mis Platos» para crear uno.
                </p>
              )}
              {filteredDishes.length === 0 && isSearching && exactMatch && (
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
