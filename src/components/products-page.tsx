"use client"

import { useState, useEffect, useTransition } from "react"
import { Plus, Trash2, Pencil, Check, X, Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getAllProducts, createProduct, deleteProduct, updateProduct } from "@/lib/actions/products"
import type { Product } from "@/lib/db/types"

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const all = await getAllProducts()
      setProducts(all)
      setFiltered(all)
    })
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(q ? products.filter(p => p.name.includes(q)) : products)
  }, [search, products])

  async function handleCreate() {
    if (!newName.trim()) return
    const product = await createProduct(newName.trim())
    const updated = [...products, product].sort((a, b) => a.name.localeCompare(b.name))
    setProducts(updated)
    setNewName("")
  }

  async function handleDelete(id: number) {
    await deleteProduct(id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  async function handleUpdate(id: number) {
    if (!editingName.trim()) return
    const updated = await updateProduct(id, editingName.trim())
    setProducts(prev => prev.map(p => p.id === id ? updated : p))
    setEditingId(null)
  }

  return (
    <div className="px-3 pt-4">
      <h1 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Diccionario de Productos</h1>

      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Nuevo producto..."
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

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8"
          style={{ borderColor: "var(--border)", background: "var(--muted)" }}
        />
      </div>

      <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
        {filtered.length} productos
      </p>

      {pending && products.length === 0 && (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
        </div>
      )}

      <div className="space-y-1.5">
        {filtered.map(product => (
          <div key={product.id} className="flex items-center gap-2 p-3 rounded-xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            {editingId === product.id ? (
              <>
                <Input
                  autoFocus
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleUpdate(product.id); if (e.key === "Escape") setEditingId(null) }}
                  className="flex-1 h-8 text-sm"
                  style={{ borderColor: "var(--primary)" }}
                />
                <button onClick={() => handleUpdate(product.id)} style={{ color: "var(--primary)" }}>
                  <Check size={16} />
                </button>
                <button onClick={() => setEditingId(null)} style={{ color: "var(--muted-foreground)" }}>
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm capitalize" style={{ color: "var(--foreground)" }}>{product.name}</span>
                <button onClick={() => { setEditingId(product.id); setEditingName(product.name) }}
                  style={{ color: "var(--muted-foreground)" }}>
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(product.id)} style={{ color: "var(--destructive)" }}>
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
