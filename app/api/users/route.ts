import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const users = await prisma.user.findMany({
      select: {
        username: true,
        role: true,
        rpsCoins: true,
        stakingRPS: true,
        usdtBalance: true,
        eRPS: true,
        withdrawableERPS: true,
        lastLogin: true,
        createdAt: true
      }
    })
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { username, rpsCoins, usdtBalance, eRPS, withdrawableERPS, stakingRPS } = data

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
          stakingRecords: true,
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

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { username, amount, rpsCoins, stakingRPS, duration, apr, penalty } = data

    const user = await prisma.user.findUnique({
      where: { username },
      include: { stakingRecords: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user and create staking record in a transaction
    const result = await prisma.$transaction([
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

    const updatedUser = await prisma.user.findUnique({
      where: { username },
      include: { stakingRecords: true }
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