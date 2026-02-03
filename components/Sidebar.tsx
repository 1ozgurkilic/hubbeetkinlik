'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, LogOut, LayoutDashboard } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { name: 'Takvim', href: '/dashboard', icon: Calendar },
  { name: 'Personel Rozetleri', href: '/dashboard/staff', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const isCalendar = pathname === '/dashboard'

  return (
    <aside className="w-64 border-r-4 border-[var(--border)] flex flex-col h-full transition-colors duration-300 z-30 bg-[var(--card)]">
      <div className="p-6 border-b-4 border-[var(--border)] bg-[var(--accent)]/30">
        <h1 className="text-3xl font-pixel text-center tracking-widest drop-shadow-md text-[var(--primary)]">
          HUBBE
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-3 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-pixel text-xl tracking-wide border-4",
                isActive 
                  ? "bg-[var(--primary)] text-white border-[var(--border)] shadow-[4px_4px_0px_var(--border)]" 
                  : "text-[var(--foreground)] opacity-60 border-transparent hover:bg-[var(--accent)] hover:opacity-100"
              )}
            >
              <Icon className={clsx("w-6 h-6", isActive && "animate-bounce")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t-4 border-[var(--border)] bg-[var(--accent)]/10">
        <button 
          onClick={async () => {
             const res = await fetch('/api/auth/logout', { method: 'POST' })
             if (res.ok) window.location.href = '/login'
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-pixel text-lg border-2 text-red-500 border-red-500/50 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
