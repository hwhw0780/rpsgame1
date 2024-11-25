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

    // Log the incoming update data
    console.log('Updating user:', username)
    console.log('Update data:', updates)

    // Validate the numbers
    const updateData = {
      rpsCoins: Math.max(0, Number(updates.rpsCoins) || 0),
      usdtBalance: Math.max(0, Number(updates.usdtBalance) || 0),
      eRPS: Math.max(0, Number(updates.eRPS) || 0),
      withdrawableERPS: Math.max(0, Number(updates.withdrawableERPS) || 0),
    }

    // Update user data
    const user = await prisma.user.update({
      where: { 
        username: username 
      },
      data: updateData
    })

    // Log the result
    console.log('Update successful:', user)

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