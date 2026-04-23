"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { Plus, CheckCircle, ToggleLeft, ToggleRight, Loader2, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { DishEditorSheet } from "@/components/dish-editor-sheet"
import { getDishes, createDish } from "@/lib/actions/dishes"
import type { Dish, DishCategory, MealSection } from "@/lib/db/types"
import { DISH_CATEGORIES, MEAL_SECTIONS } from "@/lib/db/types"

export function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [showQuantities, setShowQuantities] = useState(false)
  const [editing, setEditing] = useState<Dish | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newCategory, setNewCategory] = useState<DishCategory>("PLATO_PREPARADO")
  const [newMealSections, setNewMealSections] = useState<MealSection[]>([])
  const [creating, setCreating] = useState(false)
  const [pending, startTransition] = useTransition()
  const [expandedCategory, setExpandedCategory] = useState<DishCategory | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function toggleCategory(cat: DishCategory) {
    setExpandedCategory(prev => prev === cat ? null : cat)
  }

  useEffect(() => {
    startTransition(async () => {
      setDishes(await getDishes())
    })
  }, [])

  useEffect(() => {
    if (createOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [createOpen])

  function toggleNewMealSection(section: MealSection) {
    setNewMealSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    )
  }

  function resetCreateForm() {
    setNewName("")
    setNewCategory("PLATO_PREPARADO")
    setNewMealSections([])
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const dish = await createDish(newName.trim(), newCategory, newMealSections)
    setDishes(prev => [dish, ...prev])
    resetCreateForm()
    setCreateOpen(false)
    setEditing(dish)
    setCreating(false)
  }

  function handleDelete(id: number) {
    setDishes(prev => prev.filter(d => d.id !== id))
  }

  function handleSaved(updated: Dish) {
    setDishes(prev => prev.map(d => d.id === updated.id ? updated : d))
  }

  return (
    <div className="px-3 pt-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Mis Platos</h1>
        <button onClick={() => setShowQuantities(v => !v)} className="flex items-center gap-1 text-xs"
          style={{ color: "var(--muted-foreground)" }}>
          {showQuantities ? <ToggleRight size={18} style={{ color: "var(--primary)" }} /> : <ToggleLeft size={18} />}
          Cantidades
        </button>
      </div>

      {/* Lista agrupada por categoría */}
      {pending && dishes.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
        </div>
      ) : (
        <div className="space-y-2">
          {DISH_CATEGORIES.map(cat => {
            const group = dishes.filter(d => d.category === cat.value)
            if (group.length === 0) return null
            const expanded = expandedCategory === cat.value
            return (
              <div key={cat.value} className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
                {/* Cabecera de categoría */}
                <button
                  onClick={() => toggleCategory(cat.value)}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left"
                  style={{ background: "var(--card)" }}>
                  {expanded
                    ? <ChevronDown size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                    : <ChevronRight size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                  }
                  <span className="flex-1 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    {cat.label}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                    {group.length}
                  </span>
                </button>

                {/* Lista de platos expandida */}
                {expanded && (
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    {group.map((dish, idx) => (
                      <button
                        key={dish.id}
                        onClick={() => setEditing(dish)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:opacity-80"
                        style={{
                          background: "var(--card)",
                          borderTop: idx > 0 ? "1px solid var(--border)" : undefined,
                        }}>
                        {dish.verified
                          ? <CheckCircle size={15} style={{ color: "var(--verified)", flexShrink: 0 }} />
                          : <div className="w-[15px] h-[15px] rounded-full flex-shrink-0" style={{ border: "1.5px solid var(--border)" }} />
                        }
                        <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                          {dish.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {!pending && dishes.length === 0 && (
            <p className="text-center text-sm py-10" style={{ color: "var(--muted-foreground)" }}>
              {"Aún no tienes platos. ¡Crea el primero!"}
            </p>
          )}
        </div>
      )}

      {/* Botón flotante crear */}
      <div className="fixed bottom-24 right-4 z-30">
        <Button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 shadow-lg rounded-2xl px-5 h-12 text-sm font-semibold"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          <Plus size={18} />
          Crear plato
        </Button>
      </div>

      {/* Dialog crear plato */}
      <Dialog open={createOpen} onOpenChange={v => { if (!v) { setCreateOpen(false); resetCreateForm() } }}>
        <DialogContent showCloseButton={false}
          style={{ background: "var(--card)", color: "var(--card-foreground)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--foreground)" }}>Nuevo plato</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>Nombre</p>
              <Input
                ref={inputRef}
                placeholder="Ej: Pasta a la boloñesa"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                style={{ borderColor: "var(--border)", background: "var(--muted)" }}
              />
            </div>

            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>Categoría</p>
              <div className="flex flex-wrap gap-2">
                {DISH_CATEGORIES.map(c => {
                  const active = newCategory === c.value
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewCategory(c.value)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{
                        background: active ? "var(--primary)" : "var(--muted)",
                        color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
                        border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                      }}>
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Disponible en
                <span className="ml-1 font-normal" style={{ opacity: 0.7 }}>(vacío = todas)</span>
              </p>
              <div className="flex gap-2">
                {MEAL_SECTIONS.map(s => {
                  const active = newMealSections.includes(s.value)
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => toggleNewMealSection(s.value)}
                      className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                      style={{
                        background: active ? "var(--primary)" : "var(--muted)",
                        color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
                        border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                      }}>
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm() }}
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || creating}
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              {creating ? <Loader2 size={16} className="animate-spin" /> : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DishEditorSheet
        dish={editing}
        open={!!editing}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
        onDeleted={(id) => {
          handleDelete(id)
          setEditing(null)
        }}
        showQuantities={showQuantities}
      />
    </div>
  )
}
