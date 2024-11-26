import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { username, rpsCoins, usdtBalance, eRPS, withdrawableERPS, stakingRPS, stakedAmounts } = data

    // Use transaction to ensure atomic updates
    const user = await prisma.$transaction(async (tx) => {
      // Update user balances
      const updatedUser = await tx.user.update({
        where: { username },
        data: {
          ...(typeof rpsCoins === 'number' && { rpsCoins }),
          ...(typeof usdtBalance === 'number' && { usdtBalance }),
          ...(typeof eRPS === 'number' && { eRPS }),
          ...(typeof withdrawableERPS === 'number' && { withdrawableERPS }),
          ...(typeof stakingRPS === 'number' && { stakingRPS })
        },
        select: {
          id: true,
          username: true,
          rpsCoins: true,
          usdtBalance: true,
          eRPS: true,
          withdrawableERPS: true,
          stakingRPS: true,
          role: true
        }
      })

      // If stakedAmounts is provided (for unstaking), clear staking records
      if (stakedAmounts !== undefined) {
        await tx.stakingRecord.deleteMany({
          where: { userId: updatedUser.id }
        })
      }

      return updatedUser
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating balance:', error)
    return NextResponse.json(
      { error: 'Failed to update balance' },
      { status: 500 }
    )
  }
} 