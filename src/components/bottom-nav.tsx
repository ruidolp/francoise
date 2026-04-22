"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, UtensilsCrossed, ShoppingCart, BookOpen } from "lucide-react"

const NAV = [
  { href: "/",           label: "Semana",    icon: Calendar },
  { href: "/platos",     label: "Platos",    icon: UtensilsCrossed },
  { href: "/compras",    label: "Compras",   icon: ShoppingCart },
  { href: "/productos",  label: "Productos", icon: BookOpen },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t"
      style={{ background: "var(--nav-bg)", borderColor: "var(--nav-border)" }}>
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors"
            style={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}>
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className={active ? "font-semibold" : ""}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
