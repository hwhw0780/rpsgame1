import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: 'user',
        rpsCoins: 40000,
        stakingRPS: 10000,
        usdtBalance: 0,
        eRPS: 0,
        withdrawableERPS: 0,
        lastLogin: new Date()
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    )
  }
} 