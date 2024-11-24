import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting seed...')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: adminPassword,
        role: 'admin',
        rpsCoins: 0,
        stakingRPS: 0,
        usdtBalance: 0,
        eRPS: 0,
        withdrawableERPS: 0,
        lastLogin: new Date()
      },
    })
    console.log('Created admin user:', admin.username)

    // Create test user
    const userPassword = await bcrypt.hash('password123', 10)
    const user = await prisma.user.upsert({
      where: { username: 'user1' },
      update: {},
      create: {
        username: 'user1',
        password: userPassword,
        role: 'user',
        rpsCoins: 40000,
        stakingRPS: 10000,
        usdtBalance: 0,
        eRPS: 0,
        withdrawableERPS: 0,
        lastLogin: new Date()
      },
    })
    console.log('Created test user:', user.username)

    console.log('Seed completed successfully')
  } catch (error) {
    console.error('Error during seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 