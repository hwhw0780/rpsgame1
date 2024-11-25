import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function GET(
  request: Request,
  context: { params: { username: string } }
) {
  try {
    const headersList = headers()
    const username = context.params.username

    const user = await prisma.user.findUnique({
      where: { 
        username: username 
      },
      select: {
        id: true,
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
} 