import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { username, newRPSBalance, newStakingRPS } = data

    const user = await prisma.$transaction(async (tx) => {
      // Get user first to get the ID
      const currentUser = await tx.user.findUnique({
        where: { username },
        select: { id: true }
      })

      if (!currentUser) {
        throw new Error('User not found')
      }

      // Delete all staking records
      await tx.stakingRecord.deleteMany({
        where: { userId: currentUser.id }
      })

      // Update user balances
      const updatedUser = await tx.user.update({
        where: { username },
        data: {
          rpsCoins: newRPSBalance,
          stakingRPS: newStakingRPS
        },
        select: {
          username: true,
          rpsCoins: true,
          stakingRPS: true,
          stakingRecords: true
        }
      })

      return updatedUser
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error unstaking:', error)
    return NextResponse.json(
      { error: 'Failed to unstake' },
      { status: 500 }
    )
  }
} 