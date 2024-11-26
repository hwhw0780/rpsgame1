import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { username, rpsCoins, usdtBalance, eRPS, withdrawableERPS, stakingRPS, dailyRewards } = data

    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { username },
        data: {
          ...(typeof rpsCoins === 'number' && { rpsCoins }),
          ...(typeof usdtBalance === 'number' && { usdtBalance }),
          ...(typeof eRPS === 'number' && { eRPS }),
          ...(typeof withdrawableERPS === 'number' && { withdrawableERPS }),
          ...(typeof stakingRPS === 'number' && { stakingRPS }),
          ...(typeof dailyRewards === 'number' && { dailyRewards })
        },
        select: {
          id: true,
          username: true,
          rpsCoins: true,
          usdtBalance: true,
          eRPS: true,
          withdrawableERPS: true,
          stakingRPS: true,
          dailyRewards: true,
          role: true
        }
      })

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