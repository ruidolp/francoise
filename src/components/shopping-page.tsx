"use client"

import { useState, useEffect, useTransition } from "react"
import { Plus, X, Loader2, ShoppingCart, CheckSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getOrCreateWeek } from "@/lib/actions/weeks"
import { getShoppingList } from "@/lib/actions/shopping"
import { getMondayOf, formatWeekRange } from "@/lib/utils/week"
import { searchProducts, createProduct } from "@/lib/actions/products"
import type { Product } from "@/lib/db/types"

interface ShoppingItem {
  product_id: number
  product_name: string
  count: number
  quantities: Array<{ qty: number | null; unit: string | null; dish: string }>
  checked: boolean
  manual?: boolean
}

export function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [pending, startTransition] = useTransition()
  const [weekLabel, setWeekLabel] = useState("")
  const [addValue, setAddValue] = useState("")
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [showSugg, setShowSugg] = useState(false)

  useEffect(() => {
    startTransition(async () => {
      const monday = getMondayOf(new Date())
      setWeekLabel(formatWeekRange(monday))
      const week = await getOrCreateWeek(monday)
      const list = await getShoppingList(week.id)
      setItems(list.map(i => ({ ...i, checked: false })))
    })
  }, [])

  useEffect(() => {
    if (!addValue.trim()) { setSuggestions([]); setShowSugg(false); return }
    const t = setTimeout(async () => {
      const r = await searchProducts(addValue)
      setSuggestions(r)
      setShowSugg(true)
    }, 200)
    return () => clearTimeout(t)
  }, [addValue])

  function toggle(productId: number) {
    setItems(prev => prev.map(i => i.product_id === productId ? { ...i, checked: !i.checked } : i))
  }

  function removeManual(productId: number) {
    setItems(prev => prev.filter(i => i.product_id !== productId || !i.manual))
  }

  async function addItem(product: Product) {
    if (items.some(i => i.product_id === product.id)) {
      setItems(prev => prev.map(i => i.product_id === product.id ? { ...i, checked: false } : i))
    } else {
      setItems(prev => [...prev, {
        product_id: product.id,
        product_name: product.name,
        count: 0,
        quantities: [],
        checked: false,
        manual: true,
      }])
    }
    setAddValue("")
    setShowSugg(false)
  }

  async function handleAddNew() {
    if (!addValue.trim()) return
    const product = await createProduct(addValue.trim())
    await addItem(product)
  }

  const exactMatch = suggestions.some(s => s.name.toLowerCase() === addValue.trim().toLowerCase())
  const unchecked = items.filter(i => !i.checked)
  const checked = items.filter(i => i.checked)

  return (
    <div className="px-3 pt-4">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Lista de Compras</h1>
        <ShoppingCart size={18} style={{ color: "var(--primary)" }} />
      </div>
      <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>{weekLabel}</p>

      {/* Agregar producto */}
      <div className="relative mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Agregar producto..."
            value={addValue}
            onChange={e => setAddValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !exactMatch) handleAddNew() }}
            style={{ borderColor: "var(--border)", background: "var(--muted)" }}
          />
          <Button size="icon" onClick={handleAddNew} disabled={!addValue.trim()}
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            <Plus size={16} />
          </Button>
        </div>
        {showSugg && suggestions.length > 0 && (
          <div className="absolute left-0 right-10 top-full mt-1 rounded-xl shadow-lg z-50 overflow-hidden"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            {suggestions.map(s => (
              <button key={s.id} onMouseDown={() => addItem(s)}
                className="w-full text-left px-3 py-2.5 text-sm" style={{ color: "var(--foreground)" }}>
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {pending && (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
        </div>
      )}

      {!pending && items.length === 0 && (
        <p className="text-center text-sm py-10" style={{ color: "var(--muted-foreground)" }}>
          No hay platos asignados esta semana.
        </p>
      )}

      {/* Items pendientes */}
      <div className="space-y-1.5 mb-4">
        {unchecked.map(item => (
          <div key={item.product_id}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            onClick={() => toggle(item.product_id)}>
            <div className="w-5 h-5 rounded-md flex-shrink-0" style={{ border: "2px solid var(--primary)" }} />
            <span className="flex-1 text-sm font-medium capitalize" style={{ color: "var(--foreground)" }}>
              {item.product_name}
            </span>
            {item.count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
                ({item.count})
              </span>
            )}
            {item.manual && (
              <button onClick={e => { e.stopPropagation(); removeManual(item.product_id) }}
                className="p-0.5" style={{ color: "var(--muted-foreground)" }}>
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Items comprados */}
      {checked.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare size={14} style={{ color: "var(--muted-foreground)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              Comprado ({checked.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {checked.map(item => (
              <div key={item.product_id}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer opacity-50"
                style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
                onClick={() => toggle(item.product_id)}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--primary)" }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="flex-1 text-sm line-through capitalize" style={{ color: "var(--muted-foreground)" }}>
                  {item.product_name}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
