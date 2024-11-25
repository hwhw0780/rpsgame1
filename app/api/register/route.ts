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

    // Validate referral code if provided
    let referrer = null
    if (data.referralCode) {
      referrer = await prisma.user.findFirst({
        where: {
          AND: [
            { referralCode: data.referralCode },
            { referralCode: { not: null } }
          ]
        }
      })

      if (!referrer) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        )
      }
    }

    // Generate unique referral code for new user
    const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create new user
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
        referralCode: newReferralCode,
        referredBy: data.referralCode || null,
        referralBonus: 0
      }
    })

    const { password: _, ...userData } = user
    return NextResponse.json({ user: userData })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
} 