"use client"

import { useState, useEffect, useRef } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, CheckCircle, Loader2, ChevronDown, Trash2 } from "lucide-react"
import { ProductAutocomplete } from "@/components/product-autocomplete"
import { getDishWithIngredients, saveDishIngredients, updateDish } from "@/lib/actions/dishes"
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
  const [showDeleteOption, setShowDeleteOption] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const dishIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!open || !dish) {
      setIngredients([])
      return
    }
    setName(dish.name)
    dishIdRef.current = dish.id
    setLoading(true)

    Promise.all([getDishWithIngredients(dish.id), getUnits()]).then(([data, unitList]) => {
      if (dishIdRef.current !== dish.id) return // plato cambió mientras cargaba
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
  }, [open, dish?.id]) // solo re-ejecuta si cambia el ID del plato

  function addIngredient(product: Product) {
    setIngredients(prev => {
      if (prev.some(i => i.product_id === product.id)) return prev
      return [...prev, { product_id: product.id, product_name: product.name, quantity: null, unit_id: null }]
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
    try {
      onDeleted(dish.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl px-4 pt-4 flex flex-col"
        style={{ background: "var(--card)", color: "var(--card-foreground)" }}>
        <SheetHeader className="mb-3">
          <SheetTitle className="flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            {dish?.verified && <CheckCircle size={16} style={{ color: "var(--verified)" }} />}
            Editar plato
          </SheetTitle>
        </SheetHeader>

        {/* Nombre */}
        <div className="mb-4">
          <Label className="text-xs mb-1 block" style={{ color: "var(--muted-foreground)" }}>Nombre</Label>
          <Input value={name} onChange={e => setName(e.target.value)}
            style={{ borderColor: "var(--border)", background: "var(--muted)" }} />
        </div>

        {/* Ingredientes: lista scrolleable separada del autocomplete */}
        <div className="flex-1 flex flex-col min-h-0">
          <Label className="text-xs mb-2 block" style={{ color: "var(--muted-foreground)" }}>
            Ingredientes {loading && <Loader2 size={10} className="inline animate-spin ml-1" />}
          </Label>

          {/* Lista con scroll propio — no corta el dropdown */}
          <div className="overflow-y-auto mb-3 space-y-2" style={{ maxHeight: "calc(85vh - 300px)" }}>
            {ingredients.length === 0 && !loading && (
              <p className="text-xs py-2" style={{ color: "var(--muted-foreground)" }}>
                Agrega ingredientes abajo.
              </p>
            )}
            {ingredients.map(ing => (
              <div key={ing.product_id} className="flex items-center gap-2 rounded-xl p-2"
                style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                <span className="flex-1 text-sm truncate capitalize">{ing.product_name}</span>
                {showQuantities && (
                  <>
                    <Input type="number" placeholder="Cant." value={ing.quantity ?? ""}
                      onChange={e => setQty(ing.product_id, e.target.value)}
                      className="w-16 text-center text-sm h-8"
                      style={{ borderColor: "var(--border)" }} />
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
                  style={{ color: "var(--muted-foreground)" }}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Autocomplete FUERA del scroll — el dropdown no queda cortado */}
          <ProductAutocomplete onSelect={addIngredient} />
        </div>

        <div className="pt-3 pb-2 space-y-2">
          <Button onClick={handleSave} disabled={saving} className="w-full"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            {saving
              ? <Loader2 size={16} className="animate-spin" />
              : <><CheckCircle size={16} className="mr-2" /> Guardar y verificar</>
            }
          </Button>

          <button onClick={() => setShowDeleteOption(!showDeleteOption)}
            className="w-full py-2 text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
            style={{ color: "var(--muted-foreground)", background: "transparent" }}>
            <ChevronDown size={14} style={{ transform: showDeleteOption ? "rotate(180deg)" : "rotate(0)" }} />
            Más opciones
          </button>

          {showDeleteOption && (
            <Button onClick={handleDelete} disabled={deleting} variant="destructive" className="w-full"
              style={{ background: "var(--destructive)", color: "white" }}>
              {deleting
                ? <Loader2 size={16} className="animate-spin" />
                : <><Trash2 size={16} className="mr-2" /> Eliminar plato</>
              }
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
