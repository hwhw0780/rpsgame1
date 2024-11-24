import { PrismaClient, Prisma } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const userData1: Prisma.UserCreateInput = {
    username: 'testuser1',
    password: 'password123',
    role: 'user',
    rpsCoins: 10000,
    stakingRPS: 0,
    usdtBalance: 100.0,
    eRPS: 5000,
    withdrawableERPS: 0,
    lastLogin: new Date()
  }

  const userData2: Prisma.UserCreateInput = {
    username: 'testuser2',
    password: 'password123',
    role: 'user',
    rpsCoins: 20000,
    stakingRPS: 5000,
    usdtBalance: 200.0,
    eRPS: 10000,
    withdrawableERPS: 1000,
    lastLogin: new Date()
  }

  await prisma.user.upsert({
    where: { username: 'testuser1' },
    update: {},
    create: userData1
  })

  await prisma.user.upsert({
    where: { username: 'testuser2' },
    update: {},
    create: userData2
  })

  console.log('Seeding completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 