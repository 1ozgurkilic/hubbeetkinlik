import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { start: 'asc' }
    })
    return NextResponse.json(events)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, start } = body
    const event = await prisma.event.create({
      data: {
        title,
        start: new Date(start)
      }
    })
    return NextResponse.json(event)
  } catch (error: any) {
    console.error('MINIMAL POST ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
