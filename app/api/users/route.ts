import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { Prisma } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const userData: Prisma.UserCreateInput = {
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

    const user = await prisma.user.create({
      data: userData
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