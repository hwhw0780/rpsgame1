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
        balancePoints: 0,
        playablePoints: 0,
        withdrawablePoints: 0
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
        balancePoints: 40000,
        playablePoints: 10000,
        withdrawablePoints: 0
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