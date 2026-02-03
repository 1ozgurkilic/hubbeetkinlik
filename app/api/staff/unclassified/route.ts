import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const unclassifiedDir = path.join(process.cwd(), 'public', 'badges', 'unclassified')
    
    // Ensure directory exists
    if (!fs.existsSync(unclassifiedDir)) {
      fs.mkdirSync(unclassifiedDir, { recursive: true })
    }

    const files = fs.readdirSync(unclassifiedDir)
    const images = files.filter(f => /\.(png|jpg|jpeg|gif|svg)$/i.test(f))
    
    const badges = images.map(filename => ({
      code: filename.split('.')[0],
      imageUrl: `/badges/unclassified/${filename}`
    }))

    return NextResponse.json(badges)
  } catch (error) {
    console.error('Failed to read unclassified badges:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
