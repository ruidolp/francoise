"use client"

import { useState, useEffect, useTransition } from "react"
import { Plus, CheckCircle, Search, ToggleLeft, ToggleRight, Loader2, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DishEditorSheet } from "@/components/dish-editor-sheet"
import { getDishes, createDish, deleteDish } from "@/lib/actions/dishes"
import type { Dish } from "@/lib/db/types"

export function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [search, setSearch] = useState("")
  const [showQuantities, setShowQuantities] = useState(false)
  const [editing, setEditing] = useState<Dish | null>(null)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [pending, startTransition] = useTransition()
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    startTransition(async () => {
      setDishes(await getDishes())
    })
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      startTransition(async () => setDishes(await getDishes(search)))
    }, 250)
    return () => clearTimeout(t)
  }, [search])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const dish = await createDish(newName.trim())
    setDishes(prev => [dish, ...prev])
    setNewName("")
    setEditing(dish)
    setCreating(false)
  }

  async function handleDelete(id: number) {
    await deleteDish(id)
    setDishes(prev => prev.filter(d => d.id !== id))
  }

  function handleSaved(updated: Dish) {
    setDishes(prev => prev.map(d => d.id === updated.id ? updated : d))
  }

  return (
    <div className="px-3 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Mis Platos</h1>
        <button onClick={() => setShowQuantities(v => !v)} className="flex items-center gap-1 text-xs"
          style={{ color: "var(--muted-foreground)" }}>
          {showQuantities ? <ToggleRight size={18} style={{ color: "var(--primary)" }} /> : <ToggleLeft size={18} />}
          Cantidades
        </button>
      </div>

      {/* Crear nuevo */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Nombre del plato..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCreate()}
          style={{ borderColor: "var(--border)", background: "var(--muted)" }}
        />
        <Button onClick={handleCreate} disabled={!newName.trim() || creating} size="icon"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        </Button>
      </div>

      {/* Botón de búsqueda */}
      {!showSearch && (
        <div className="mb-4">
          <Button onClick={() => setShowSearch(true)} variant="outline" size="sm" className="w-full justify-start"
            style={{ borderColor: "var(--border)", background: "var(--muted)", color: "var(--muted-foreground)" }}>
            <Search size={14} className="mr-2" />
            Buscar plato...
          </Button>
        </div>
      )}

      {/* Input de búsqueda inline */}
      {showSearch && (
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <Input
            placeholder="Buscar plato..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onBlur={() => !search && setShowSearch(false)}
            className="pl-8"
            autoFocus
            style={{ borderColor: "var(--border)", background: "var(--muted)" }}
          />
        </div>
      )}

      {/* Lista */}
      {pending && dishes.length === 0 && (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
        </div>
      )}

      <div className="space-y-2">
        {dishes.map(dish => (
          <button key={dish.id} onClick={() => setEditing(dish)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:opacity-80"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            {dish.verified
              ? <CheckCircle size={18} style={{ color: "var(--verified)", flexShrink: 0 }} />
              : <div className="w-[18px] h-[18px] rounded-full flex-shrink-0" style={{ border: "1.5px solid var(--border)" }} />
            }
            <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
              {dish.name}
            </span>
          </button>
        ))}

        {!pending && dishes.length === 0 && (
          <p className="text-center text-sm py-10" style={{ color: "var(--muted-foreground)" }}>
            {search ? "Sin resultados." : "Aún no tienes platos. ¡Crea el primero!"}
          </p>
        )}
      </div>

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
