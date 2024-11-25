import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

type Context = {
  params: {
    username: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    const user = await prisma.user.findUnique({
      where: { 
        username: context.params.username 
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