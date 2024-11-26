import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { type NextRequest } from 'next/server'

interface RouteParams {
  params: {
    username: string
  }
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { username } = context.params

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50  // Get last 50 transactions
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ transactions: user.transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
} 