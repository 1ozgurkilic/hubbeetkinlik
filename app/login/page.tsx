'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json()
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden z-10 border-4 border-gray-200 dark:border-gray-800 transform transition-all hover:scale-[1.01]">
        <div className="bg-blue-600 p-6 text-white text-center border-b-4 border-blue-700">
          <h1 className="text-4xl font-pixel tracking-widest drop-shadow-md">HUBBE PANEL</h1>
          <p className="opacity-80 mt-2 font-pixel text-lg">Yönetim Paneli</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded font-pixel text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300 font-pixel uppercase">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-blue-500 transition-colors font-sans"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300 font-pixel uppercase">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-blue-500 transition-colors font-sans"
                placeholder="••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform active:scale-95 transition-all font-pixel text-xl uppercase tracking-wide border-b-4 border-blue-800 hover:border-blue-900"
            >
              {loading ? 'Yükleniyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 dark:bg-gray-950 p-4 text-center text-xs text-gray-500 font-pixel border-t-2 border-gray-100 dark:border-gray-800">
          &copy; 2026 Hubbe App. Güvenli Giriş.
        </div>
      </div>
    </div>
  )
}
