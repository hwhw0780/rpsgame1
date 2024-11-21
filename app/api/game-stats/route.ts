import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalGames, totalUsers, totalStakes] = await Promise.all([
      prisma.gameHistory.count(),
      prisma.user.count(),
      prisma.stakingRecord.aggregate({
        _sum: { amount: true }
      })
    ])

    return NextResponse.json({
      totalGames,
      totalUsers,
      totalStakedAmount: totalStakes._sum.amount || 0
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch game stats' },
      { status: 500 }
    )
  }
} 