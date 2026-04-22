"use client"

import { useState, useEffect, useTransition } from "react"
import { Plus, Trash2, Pencil, Check, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getUnits, createUnit, deleteUnit, updateUnit } from "@/lib/actions/units"
import type { Unit } from "@/lib/db/types"

export function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => setUnits(await getUnits()))
  }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    const unit = await createUnit(newName.trim())
    setUnits(prev => [...prev, unit].sort((a, b) => a.name.localeCompare(b.name)))
    setNewName("")
  }

  async function handleDelete(id: number) {
    await deleteUnit(id)
    setUnits(prev => prev.filter(u => u.id !== id))
  }

  async function handleUpdate(id: number) {
    if (!editingName.trim()) return
    const updated = await updateUnit(id, editingName.trim())
    setUnits(prev => prev.map(u => u.id === id ? updated : u))
    setEditingId(null)
  }

  return (
    <div className="px-3 pt-4">
      <h1 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Unidades de medida</h1>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Nueva unidad (ej: taza, kg, ml...)"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCreate()}
          style={{ borderColor: "var(--border)", background: "var(--muted)" }}
        />
        <Button onClick={handleCreate} disabled={!newName.trim()} size="icon"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          <Plus size={16} />
        </Button>
      </div>

      {pending && units.length === 0 && (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
        </div>
      )}

      <div className="space-y-2">
        {units.map(unit => (
          <div key={unit.id} className="flex items-center gap-2 p-3 rounded-xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            {editingId === unit.id ? (
              <>
                <Input
                  autoFocus
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleUpdate(unit.id); if (e.key === "Escape") setEditingId(null) }}
                  className="flex-1 h-8 text-sm"
                  style={{ borderColor: "var(--primary)" }}
                />
                <button onClick={() => handleUpdate(unit.id)} style={{ color: "var(--primary)" }}>
                  <Check size={16} />
                </button>
                <button onClick={() => setEditingId(null)} style={{ color: "var(--muted-foreground)" }}>
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium" style={{ color: "var(--foreground)" }}>{unit.name}</span>
                <button onClick={() => { setEditingId(unit.id); setEditingName(unit.name) }}
                  style={{ color: "var(--muted-foreground)" }}>
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(unit.id)} style={{ color: "var(--destructive)" }}>
                  <Trash2 size={15} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
