import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Check for admin credentials
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({
        user: {
          id: 'admin',
          username: 'admin',
          role: 'admin',
          rpsCoins: 0,
          stakingRPS: 0,
          usdtBalance: 0
        }
      })
    }

    // Check database for user
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    const { password: _, ...userData } = user
    return NextResponse.json({ user: userData })

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
} 