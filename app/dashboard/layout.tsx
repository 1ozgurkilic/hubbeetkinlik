'use client'

import { Sidebar } from '@/components/Sidebar'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isCalendar = pathname === '/dashboard'

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isCalendar ? 'bg-[#FFF8E1]' : 'bg-[#0f0f0f]'}`}>
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Only show standard header if NOT on the custom-themed calendar page */}
        {!isCalendar && (
          <header className="h-16 border-b-2 border-[#2a2a2a] bg-[#161616] flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
            <h2 className="font-pixel text-xl text-gray-400">Kontrol Paneli</h2>
            <div className="flex items-center gap-4">
              <span className="font-pixel text-sm bg-blue-900/30 px-3 py-1 rounded-full text-blue-400 border border-blue-800">
                Admin
              </span>
              <ThemeSwitcher />
            </div>
          </header>
        )}

        <div className="flex-1 overflow-auto relative">
          {children}
        </div>
      </main>
    </div>
  )
}
