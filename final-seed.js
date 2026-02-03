const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- FINAL SEED STARTING ---');

  // 1. Categories
  const categories = [
    { name: 'Sandalye Kapmaca', color: '#FF7043' },
    { name: 'Günah Keçisi', color: '#81C784' },
    { name: 'Çatlayan Buzdan Kaç', color: '#4FC3F7' },
    { name: 'Düşen Yumurtalar', color: '#FFD54F' },
    { name: 'Taş-Kağıt-Makas', color: '#BA68C8' },
    { name: 'Karoları Eşle', color: '#FF8A80' },
    { name: 'Balon Oyunu', color: '#AED581' }
  ];

  for (const cat of categories) {
    await prisma.eventCategory.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat
    });
  }
  console.log('Categories seeded.');

  // 2. Teams
  const teams = [
    { name: 'Yönetim', category: 'Upper', order: 1 },
    { name: 'Teknisyen', category: 'Tech', order: 2 },
    { name: 'Geliştirici', category: 'Lower', order: 3 }
  ];

  for (const team of teams) {
    await prisma.team.upsert({
      where: { name: team.name },
      update: team,
      create: team
    });
  }
  console.log('Teams seeded.');

  console.log('--- SEED COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

main().catch(err => {
  console.error('SEED ERROR:', err);
  process.exit(1);
});
