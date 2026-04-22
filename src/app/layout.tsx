import type { Metadata, Viewport } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { BottomNav } from "@/components/bottom-nav"
import { ThemeSelector } from "@/components/theme-selector"
import { SwRegister } from "@/components/sw-register"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Francoise",
  description: "Planificador semanal de comidas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Francoise",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3a7d44",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning data-theme="natural" className={nunito.variable}>
      <body>
        <ThemeProvider>
          <header className="sticky top-0 z-40 flex justify-end px-3 py-2"
            style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
            <ThemeSelector />
          </header>
          <main className="pb-20">
            {children}
          </main>
          <BottomNav />
          <SwRegister />
        </ThemeProvider>
      </body>
    </html>
  )
}
