'use client'

import { useTheme } from '@/components/ThemeProvider'
import { Palette } from 'lucide-react'
import { useState } from 'react'

const themes = [
  'default', 'dark', 'red', 'green', 'purple', 
  'orange', 'pink', 'gold', 'retro', 'forest', 'cyber'
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-[var(--card)] border-2 border-[var(--border)] hover:bg-[var(--accent)] transition-colors pixel-corners"
        title="Tema Değiştir"
      >
        <Palette className="w-5 h-5 text-[var(--foreground)]" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl shadow-xl z-50 p-2 grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95 duration-200">
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => { setTheme(t as any); setIsOpen(false) }}
                className={`
                  p-2 rounded-md text-xs font-pixel uppercase text-center border transition-all
                  ${theme === t ? 'border-[var(--primary)] ring-2 ring-[var(--primary)] ring-opacity-50' : 'border-transparent hover:border-[var(--border)]'}
                `}
                style={{
                  backgroundColor: t === 'dark' ? '#000' : t === 'red' ? '#fee2e2' : '#fff',
                  color: t === 'dark' ? '#fff' : '#000'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
