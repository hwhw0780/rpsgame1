import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Props = {
  params: {
    username: string
  }
}

export async function GET(
  _req: Request,
  props: Props
) {
  try {
    const { username } = props.params

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