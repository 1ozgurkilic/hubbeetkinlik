import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    const adminUser = 'admin'
    const adminPass = process.env.ADMIN_PASSWORD || '1234'

    if (username === adminUser && password === adminPass) {
      const cookieStore = await cookies()
      cookieStore.set({
        name: 'auth_token',
        value: 'valid_session',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7
      })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ success: false, message: 'Giriş bilgileri hatalı' }, { status: 401 })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Hata' }, { status: 500 })
  }
}
