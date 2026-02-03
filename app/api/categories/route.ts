import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await prisma.eventCategory.findMany()
    return NextResponse.json(categories)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Hata' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, color } = await request.json()
    const category = await prisma.eventCategory.create({
      data: { name, color }
    })
    return NextResponse.json(category)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Hata' }, { status: 500 })
  }
}
