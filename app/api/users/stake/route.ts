import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { username, amount, rpsCoins, stakingRPS, duration, apr, penalty } = data

    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user and create staking record in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { username },
        data: {
          rpsCoins,
          stakingRPS
        }
      }),
      prisma.stakingRecord.create({
        data: {
          userId: user.id,
          amount,
          duration,
          apr,
          penalty,
          startDate: new Date()
        }
      })
    ])

    // Get updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        rpsCoins: true,
        stakingRPS: true,
        usdtBalance: true,
        eRPS: true,
        withdrawableERPS: true,
        stakingRecords: true
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error staking:', error)
    return NextResponse.json(
      { error: 'Failed to stake' },
      { status: 500 }
    )
  }
} 