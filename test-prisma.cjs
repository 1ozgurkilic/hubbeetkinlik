const dotenv = require('dotenv')
dotenv.config()

const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const { PrismaClient } = require('@prisma/client')

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

console.log('PrismaClient instantiated with adapter')

prisma.$connect()
  .then(() => {
    console.log('Connected successfully!')
    return prisma.eventCategory.count()
  })
  .then((count) => {
    console.log('Category count:', count)
    return prisma.$disconnect()
  })
  .catch((err) => {
    console.error('Connection error:', err.message)
    process.exit(1)
  })
