import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: { category: true },
      orderBy: { start: 'asc' }
    })
    return NextResponse.json(events)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, start, categoryId } = body
    
    const event = await prisma.event.create({
      data: {
        title,
        start: new Date(start),
        categoryId: categoryId ? parseInt(categoryId) : null
      }
    })
    return NextResponse.json(event)
  } catch (error: any) {
    console.error('API POST ERROR:', error)
    return NextResponse.json({ error: error.message || 'Ekleme başarısız' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, start, title, categoryId } = body
    const event = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        title,
        start: start ? new Date(start) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : null
      }
    })
    return NextResponse.json(event)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Güncelleme başarısız' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID eksik' }, { status: 400 })
    await prisma.event.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Silme başarısız' }, { status: 500 })
  }
}
