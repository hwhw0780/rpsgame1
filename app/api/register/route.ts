import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create new user
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: 'user',
        rpsCoins: data.rpsCoins || 40000,
        stakingRPS: data.stakingRPS || 10000,
        usdtBalance: data.usdtBalance || 0,
        eRPS: data.eRPS || 0,
        withdrawableERPS: data.withdrawableERPS || 0,
        lastLogin: new Date()
      }
    })

    // Remove password from response
    const { password: _, ...userData } = user
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
} 