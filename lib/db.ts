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
      gameHistory: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })
}

export async function getLeaderboard() {
  return await prisma.user.findMany({
    orderBy: { balancePoints: 'desc' },
    take: 10,
    select: {
      username: true,
      balancePoints: true
    }
  })
} 