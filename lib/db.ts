import { prisma } from './prisma'

export async function getUserStats(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      stakingRecords: true,
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      gameHistories: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })
}

export async function getLeaderboard() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      username: true,
      role: true,
      createdAt: true
    }
  })
} 