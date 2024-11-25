import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { type NextRequest } from 'next/server'

interface RouteParams {
  params: {
    username: string
  }
}

export async function GET(
  _request: NextRequest,
  context: RouteParams
) {
  try {
    const { username } = context.params
    
    const user = await prisma.user.findUnique({
      where: { 
        username: username 
      },
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