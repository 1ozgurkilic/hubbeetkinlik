import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('--- API SEED STARTING ---')

    // 1. Clear existing data
    await prisma.staff.deleteMany({})
    await prisma.team.deleteMany({})
    await prisma.event.deleteMany({})
    await prisma.eventCategory.deleteMany({})

    // 2. Categories
    const categories = [
      { name: 'Sandalye Kapmaca', color: '#FF7043' },
      { name: 'Günah Keçisi', color: '#81C784' },
      { name: 'Çatlayan Buzdan Kaç', color: '#4FC3F7' },
      { name: 'Düşen Yumurtalar', color: '#FFD54F' },
      { name: 'Taş-Kağıt-Makas', color: '#BA68C8' },
      { name: 'Karoları Eşle', color: '#FF8A80' },
      { name: 'Balon Oyunu', color: '#AED581' }
    ]

    for (const cat of categories) {
      await prisma.eventCategory.create({ data: cat })
    }

    // 3. Teams
    const teams = [
      { name: 'Kurucu', category: 'Üst Ekip', order: 1 },
      { name: 'Yönetici', category: 'Üst Ekip', order: 2 },
      { name: 'Menajer', category: 'Üst Ekip', order: 3 },
      { name: 'Moderatör', category: 'Üst Ekip', order: 4 },
      { name: 'Deneme Moderatör', category: 'Üst Ekip', order: 5 },
      { name: 'Geliştirici', category: 'Teknisyen Ekibi', order: 6 },
      { name: 'Scripter', category: 'Teknisyen Ekibi', order: 7 },
      { name: 'Tasarımcı', category: 'Teknisyen Ekibi', order: 8 },
      { name: 'Marketing', category: 'Teknisyen Ekibi', order: 9 },
      { name: 'Elçi', category: 'Alt Ekip', order: 10 },
      { name: 'Mimar', category: 'Alt Ekip', order: 11 },
      { name: 'Düzenek Ekibi', category: 'Alt Ekip', order: 12 },
      { name: 'Grafiker', category: 'Alt Ekip', order: 13 },
      { name: 'Reklamcı', category: 'Alt Ekip', order: 14 },
      { name: 'Ekonomist', category: 'Alt Ekip', order: 15 },
      { name: 'Resmi', category: 'Alt Ekip', order: 16 }
    ]

    for (const team of teams) {
      await prisma.team.create({ data: team })
    }

    return NextResponse.json({ success: true, message: 'Seeded successfully' })
  } catch (error: any) {
    console.error('SEED API ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
