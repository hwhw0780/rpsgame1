import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { username, rpsCoins, usdtBalance } = data

    const user = await prisma.user.update({
      where: { username },
      data: {
        rpsCoins: Number(rpsCoins),
        usdtBalance: Number(usdtBalance)
      }
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