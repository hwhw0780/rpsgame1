import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        username: true,
        rpsCoins: true,
        stakingRPS: true,
        usdtBalance: true,
        eRPS: true,
        withdrawableERPS: true,
        role: true,
        createdAt: true
      }
    })
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { username, ...updates } = data

    // Update user data
    const user = await prisma.user.update({
      where: { username },
      data: {
        rpsCoins: Number(updates.rpsCoins),
        usdtBalance: Number(updates.usdtBalance),
        eRPS: Number(updates.eRPS),
        withdrawableERPS: Number(updates.withdrawableERPS),
        // Don't allow updating password through this endpoint
      }
    })

    // Log the update
    console.log(`User ${username} updated:`, updates)

    const { password: _, ...userData } = user
    return NextResponse.json({ 
      user: userData,
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
} 