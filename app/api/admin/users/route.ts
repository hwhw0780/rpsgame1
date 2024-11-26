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

    // Ensure all fields have default values
    const sanitizedUsers = users.map(user => ({
      ...user,
      rpsCoins: user.rpsCoins || 0,
      stakingRPS: user.stakingRPS || 0,
      usdtBalance: user.usdtBalance || 0,
      eRPS: user.eRPS || 0,
      withdrawableERPS: user.withdrawableERPS || 0
    }))

    return NextResponse.json({ users: sanitizedUsers })
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

    const user = await prisma.user.update({
      where: { username },
      data: {
        ...(typeof updates.rpsCoins === 'number' && { rpsCoins: updates.rpsCoins }),
        ...(typeof updates.usdtBalance === 'number' && { usdtBalance: updates.usdtBalance }),
        ...(typeof updates.eRPS === 'number' && { eRPS: updates.eRPS }),
        ...(typeof updates.stakingRPS === 'number' && { stakingRPS: updates.stakingRPS }),
        ...(typeof updates.withdrawableERPS === 'number' && { withdrawableERPS: updates.withdrawableERPS })
      },
      select: {
        id: true,
        username: true,
        rpsCoins: true,
        usdtBalance: true,
        eRPS: true,
        stakingRPS: true,
        withdrawableERPS: true,
        stakingRecords: true,
        role: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { username } = await request.json()

    if (username === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin user' },
        { status: 403 }
      )
    }

    await prisma.user.delete({
      where: { username }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
} 