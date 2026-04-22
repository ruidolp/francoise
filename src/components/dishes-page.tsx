"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { Plus, CheckCircle, ToggleLeft, ToggleRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { DishEditorSheet } from "@/components/dish-editor-sheet"
import { getDishes, createDish, deleteDish } from "@/lib/actions/dishes"
import type { Dish } from "@/lib/db/types"

export function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [showQuantities, setShowQuantities] = useState(false)
  const [editing, setEditing] = useState<Dish | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    startTransition(async () => {
      setDishes(await getDishes())
    })
  }, [])

  useEffect(() => {
    if (createOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [createOpen])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const dish = await createDish(newName.trim())
    setDishes(prev => [dish, ...prev])
    setNewName("")
    setCreateOpen(false)
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
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Mis Platos</h1>
        <button onClick={() => setShowQuantities(v => !v)} className="flex items-center gap-1 text-xs"
          style={{ color: "var(--muted-foreground)" }}>
          {showQuantities ? <ToggleRight size={18} style={{ color: "var(--primary)" }} /> : <ToggleLeft size={18} />}
          Cantidades
        </button>
      </div>

      {/* Lista */}
      {pending && dishes.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
        </div>
      ) : (
        <div className="space-y-2">
          {dishes.map(dish => (
            <button key={dish.id} onClick={() => setEditing(dish)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:opacity-80"
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
      <Dialog open={createOpen} onOpenChange={v => { if (!v) { setCreateOpen(false); setNewName("") } }}>
        <DialogContent showCloseButton={false}
          style={{ background: "var(--card)", color: "var(--card-foreground)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--foreground)" }}>Nuevo plato</DialogTitle>
          </DialogHeader>
          <Input
            ref={inputRef}
            placeholder="Ej: Pasta a la boloñesa"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            style={{ borderColor: "var(--border)", background: "var(--muted)" }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setNewName("") }}
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
