import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { type NextRequest } from 'next/server'

interface RouteContext {
  params: {
    username: string;
  };
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const username = context.params.username

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