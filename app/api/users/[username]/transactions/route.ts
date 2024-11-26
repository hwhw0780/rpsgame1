import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { type NextRequest } from 'next/server'

type Props = {
  params: {
    username: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username },
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