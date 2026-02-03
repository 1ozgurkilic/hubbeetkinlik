const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.eventCategory.findMany();
  const teams = await prisma.team.findMany();
  console.log('--- DIAGNOSTICS ---');
  console.log('Categories Count:', cats.length);
  console.log('Teams Count:', teams.length);
  if (cats.length === 0) console.log('WARNING: Categories table is EMPTY.');
  if (teams.length === 0) console.log('WARNING: Teams table is EMPTY.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
