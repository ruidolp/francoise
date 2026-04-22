"use client"

import { useState, useEffect, useRef } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, CheckCircle, Loader2, Trash2, ChevronLeft, UtensilsCrossed } from "lucide-react"
import { ProductAutocomplete } from "@/components/product-autocomplete"
import { getDishWithIngredients, saveDishIngredients, updateDish, deleteDish } from "@/lib/actions/dishes"
import { getUnits } from "@/lib/actions/units"
import type { Dish, Unit, Product } from "@/lib/db/types"

interface Ingredient {
  product_id: number
  product_name: string
  quantity: number | null
  unit_id: number | null
}

interface Props {
  dish: Dish | null
  open: boolean
  onClose: () => void
  onSaved: (dish: Dish) => void
  onDeleted: (id: number) => void
  showQuantities: boolean
}

export function DishEditorSheet({ dish, open, onClose, onSaved, onDeleted, showQuantities }: Props) {
  const [name, setName] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const dishIdRef = useRef<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !dish) {
      setIngredients([])
      setConfirmDelete(false)
      setDeleteError(null)
      return
    }
    setName(dish.name)
    dishIdRef.current = dish.id
    setLoading(true)

    Promise.all([getDishWithIngredients(dish.id), getUnits()]).then(([data, unitList]) => {
      if (dishIdRef.current !== dish.id) return
      setUnits(unitList)
      if (data) {
        setIngredients(data.ingredients.map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity ? Number(i.quantity) : null,
          unit_id: i.unit_id ?? null,
        })))
      }
      setLoading(false)
    })
  }, [open, dish?.id])

  function addIngredient(product: Product) {
    setIngredients(prev => {
      if (prev.some(i => i.product_id === product.id)) return prev
      const next = [...prev, { product_id: product.id, product_name: product.name, quantity: null, unit_id: null }]
      setTimeout(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
      }, 0)
      return next
    })
  }

  function removeIngredient(productId: number) {
    setIngredients(prev => prev.filter(i => i.product_id !== productId))
  }

  function setQty(productId: number, qty: string) {
    setIngredients(prev => prev.map(i =>
      i.product_id === productId ? { ...i, quantity: qty ? Number(qty) : null } : i
    ))
  }

  function setUnit(productId: number, unitId: string) {
    setIngredients(prev => prev.map(i =>
      i.product_id === productId ? { ...i, unit_id: unitId ? Number(unitId) : null } : i
    ))
  }

  async function handleSave() {
    if (!dish || saving) return
    setSaving(true)
    try {
      if (name.trim() !== dish.name) await updateDish(dish.id, { name: name.trim() })
      await saveDishIngredients(dish.id, ingredients)
      onSaved({ ...dish, name: name.trim(), verified: true, updated_at: new Date() })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!dish || deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const result = await deleteDish(dish.id)
      if ("error" in result) {
        setDeleteError(result.error)
        setConfirmDelete(false)
      } else {
        onDeleted(dish.id)
        onClose()
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl p-0 flex flex-col"
        style={{ background: "var(--background)", color: "var(--foreground)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <button onClick={onClose} className="flex items-center gap-1 text-sm font-medium"
            style={{ color: "var(--muted-foreground)" }}>
            <ChevronLeft size={18} />
            Volver
          </button>
          {dish?.verified && (
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
              style={{ background: "var(--secondary)", color: "var(--verified)" }}>
              <CheckCircle size={12} />
              Verificado
            </span>
          )}
          <div style={{ width: 34 }} />
        </div>


        {/* Nombre del plato */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <p className="text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
            Nombre del plato
          </p>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full text-xl font-bold bg-transparent outline-none border-b-2 pb-1 transition-colors"
            style={{
              color: "var(--foreground)",
              borderColor: "var(--primary)",
            }}
          />
        </div>

        {/* Sección ingredientes */}
        <div className="flex-1 flex flex-col min-h-0 px-4">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <UtensilsCrossed size={15} style={{ color: "var(--muted-foreground)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Ingredientes
              </span>
              {ingredients.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                  {ingredients.length}
                </span>
              )}
              {loading && <Loader2 size={13} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />}
            </div>
          </div>

          {/* Lista scrolleable */}
          <div ref={listRef} className="overflow-y-auto flex-1 mb-3 space-y-2 pr-0.5">
            {ingredients.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Aún no hay ingredientes
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                  Usa el buscador de abajo para añadirlos
                </p>
              </div>
            )}
            {ingredients.map((ing, idx) => (
              <div key={ing.product_id}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <span className="text-xs font-medium w-5 text-center flex-shrink-0"
                  style={{ color: "var(--muted-foreground)" }}>
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm font-medium capitalize truncate" style={{ color: "var(--foreground)" }}>
                  {ing.product_name}
                </span>
                {showQuantities && (
                  <>
                    <input
                      type="number"
                      placeholder="Cant."
                      value={ing.quantity ?? ""}
                      onChange={e => setQty(ing.product_id, e.target.value)}
                      className="w-14 text-center text-sm rounded-lg px-1 py-1 outline-none"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    />
                    <Select
                      value={ing.unit_id != null ? ing.unit_id.toString() : undefined}
                      onValueChange={v => setUnit(ing.product_id, v ?? "")}>
                      <SelectTrigger className="w-20 h-8 text-xs" style={{ borderColor: "var(--border)" }}>
                        <SelectValue placeholder="Ud." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">—</SelectItem>
                        {units.map(u => (
                          <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
                <button onClick={() => removeIngredient(ing.product_id)}
                  className="flex-shrink-0 p-1 rounded-lg transition-colors"
                  style={{ color: "var(--muted-foreground)" }}>
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Buscador de ingredientes */}
          <div className="flex-shrink-0 pb-1">
            <p className="text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Añadir ingrediente
            </p>
            <ProductAutocomplete onSelect={addIngredient} />
          </div>
        </div>

        {/* Footer guardar / eliminar */}
        <div className="px-4 pt-3 pb-6 flex-shrink-0 flex flex-col gap-2"
          style={{ borderTop: "1px solid var(--border)", background: "var(--background)" }}>
          <Button onClick={handleSave} disabled={saving || !name.trim()} className="w-full h-12 text-base font-semibold rounded-xl"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            {saving
              ? <Loader2 size={18} className="animate-spin" />
              : <><CheckCircle size={18} className="mr-2" /> Guardar plato</>
            }
          </Button>

          {deleteError && (
            <div className="px-3 py-2.5 rounded-xl text-sm"
              style={{ background: "color-mix(in srgb, var(--destructive) 12%, transparent)", color: "var(--destructive)", border: "1px solid color-mix(in srgb, var(--destructive) 30%, transparent)" }}>
              {deleteError}
            </div>
          )}

          {dish && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full h-10 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              style={{ color: "var(--destructive)", border: "1px solid var(--destructive)" }}>
              <Trash2 size={15} />
              Eliminar plato
            </button>
          )}

          {confirmDelete && (
            <div className="p-3 rounded-xl flex items-center justify-between"
              style={{ background: "var(--destructive)", color: "white" }}>
              <span className="text-sm font-medium">¿Eliminar este plato?</span>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)}
                  className="text-xs px-3 py-1 rounded-lg font-medium"
                  style={{ background: "rgba(255,255,255,0.2)" }}>
                  No
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="text-xs px-3 py-1 rounded-lg font-medium flex items-center gap-1"
                  style={{ background: "white", color: "var(--destructive)" }}>
                  {deleting ? <Loader2 size={12} className="animate-spin" /> : "Sí, eliminar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
