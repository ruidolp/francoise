"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { searchProducts, createProduct } from "@/lib/actions/products"
import type { Product } from "@/lib/db/types"

interface Props {
  onSelect: (product: Product) => void
  placeholder?: string
}

export function ProductAutocomplete({ onSelect, placeholder = "Agregar ingrediente..." }: Props) {
  const [value, setValue] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!value.trim()) { setResults([]); setOpen(false); return }
    const t = setTimeout(async () => {
      const r = await searchProducts(value)
      setResults(r)
      setOpen(r.length > 0)
    }, 200)
    return () => clearTimeout(t)
  }, [value])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function select(product: Product) {
    onSelect(product)
    setValue("")
    setResults([])
    setOpen(false)
  }

  async function handleCreate() {
    if (!value.trim()) return
    const product = await createProduct(value.trim())
    select(product)
  }

  async function handleEnter() {
    const exactMatch = results.find(r => r.name.toLowerCase() === value.trim().toLowerCase())
    if (exactMatch) {
      select(exactMatch)
    } else if (results.length === 1) {
      select(results[0])
    } else if (value.trim()) {
      await handleCreate()
    }
  }

  const showCreate = value.trim() && !results.some(r => r.name.toLowerCase() === value.trim().toLowerCase())

  return (
    <div ref={ref} className="relative">
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleEnter() } }}
        placeholder={placeholder}
        style={{ borderColor: "var(--border)", background: "var(--muted)" }}
      />
      {open && (
        <div className="absolute left-0 right-0 bottom-full mb-1 rounded-xl shadow-lg z-50 overflow-hidden"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {results.map(p => (
            <button key={p.id} onMouseDown={e => { e.preventDefault(); select(p) }}
              className="w-full text-left px-3 py-2.5 text-sm"
              style={{ color: "var(--foreground)" }}>
              {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
            </button>
          ))}
          {showCreate && (
            <button onMouseDown={e => { e.preventDefault(); handleCreate() }}
              className="w-full text-left px-3 py-2.5 text-sm font-medium"
              style={{ color: "var(--primary)", borderTop: results.length > 0 ? "1px solid var(--border)" : undefined }}>
              + Crear «{value.trim()}»
            </button>
          )}
        </div>
      )}
    </div>
  )
}
