"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { Plus, Trash2, Loader2, ChevronLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { getAllProducts, createProduct, deleteProduct, updateProduct } from "@/lib/actions/products"
import type { Product } from "@/lib/db/types"

function ProductEditorSheet({
  product,
  open,
  onClose,
  onSaved,
  onDeleted,
}: {
  product: Product | null
  open: boolean
  onClose: () => void
  onSaved: (p: Product) => void
  onDeleted: (id: number) => void
}) {
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open || !product) { setConfirmDelete(false); return }
    setName(product.name)
    setConfirmDelete(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [open, product?.id])

  async function handleSave() {
    if (!product || !name.trim() || saving) return
    setSaving(true)
    try {
      const updated = await updateProduct(product.id, name.trim())
      onSaved(updated)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!product || deleting) return
    setDeleting(true)
    try {
      onDeleted(product.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl p-0 flex flex-col"
        style={{ background: "var(--background)", color: "var(--foreground)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <button onClick={onClose} className="flex items-center gap-1 text-sm"
            style={{ color: "var(--muted-foreground)" }}>
            <ChevronLeft size={18} />
            Volver
          </button>
          <button onClick={() => setConfirmDelete(v => !v)} className="p-2 rounded-xl"
            style={{ color: confirmDelete ? "var(--destructive)" : "var(--muted-foreground)" }}>
            <Trash2 size={18} />
          </button>
        </div>

        {/* Confirmación eliminar */}
        {confirmDelete && (
          <div className="mx-4 mt-3 p-3 rounded-xl flex items-center justify-between flex-shrink-0"
            style={{ background: "var(--destructive)", color: "white" }}>
            <span className="text-sm font-medium">¿Eliminar este producto?</span>
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

        {/* Nombre */}
        <div className="px-4 pt-5 pb-4 flex-shrink-0">
          <p className="text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
            Nombre del producto
          </p>
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
            className="w-full text-xl font-bold bg-transparent outline-none border-b-2 pb-1"
            style={{ color: "var(--foreground)", borderColor: "var(--primary)" }}
          />
        </div>

        {/* Guardar */}
        <div className="px-4 pb-8 flex-shrink-0">
          <Button onClick={handleSave} disabled={saving || !name.trim()} className="w-full h-12 text-base font-semibold rounded-xl"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : "Guardar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [newName, setNewName] = useState("")
  const [editing, setEditing] = useState<Product | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => setProducts(await getAllProducts()))
  }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    const product = await createProduct(newName.trim())
    setProducts(prev => [...prev, product].sort((a, b) => a.name.localeCompare(b.name)))
    setNewName("")
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

      <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
        {products.length} productos
      </p>

      {pending && products.length === 0 && (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
        </div>
      )}

      <div className="space-y-1.5">
        {products.map(product => (
          <button key={product.id} onClick={() => setEditing(product)}
            className="w-full flex items-center px-4 py-3 rounded-xl text-left transition-colors hover:opacity-80"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <span className="text-sm capitalize" style={{ color: "var(--foreground)" }}>{product.name}</span>
          </button>
        ))}
      </div>

      <ProductEditorSheet
        product={editing}
        open={!!editing}
        onClose={() => setEditing(null)}
        onSaved={updated => {
          setProducts(prev =>
            prev.map(p => p.id === updated.id ? updated : p)
              .sort((a, b) => a.name.localeCompare(b.name))
          )
          setEditing(null)
        }}
        onDeleted={id => {
          setProducts(prev => prev.filter(p => p.id !== id))
          setEditing(null)
        }}
      />
    </div>
  )
}
