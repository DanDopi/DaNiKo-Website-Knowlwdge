import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const entries = await prisma.entry.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        categories: true,
        links: true,
        videos: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, content, links, videos, categoryIds } = body

    const entry = await prisma.entry.create({
      data: {
        title,
        content,
        userId: session.user.id,
        categories: {
          connect: categoryIds?.map((id: string) => ({ id })) || []
        },
        links: {
          create: links || []
        },
        videos: {
          create: videos || []
        }
      },
      include: {
        categories: true,
        links: true,
        videos: true
      }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('id')

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    const existingEntry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        userId: session.user.id
      }
    })

    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    await prisma.entry.delete({
      where: { id: entryId }
    })

    return NextResponse.json({ message: 'Entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('id')

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { title, content, links, videos, categoryIds } = body

    const existingEntry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        userId: session.user.id
      }
    })

    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    await prisma.link.deleteMany({ where: { entryId } })
    await prisma.video.deleteMany({ where: { entryId } })

    const entry = await prisma.entry.update({
      where: { id: entryId },
      data: {
        title,
        content,
        categories: {
          set: categoryIds?.map((id: string) => ({ id })) || []
        },
        links: {
          create: links || []
        },
        videos: {
          create: videos || []
        }
      },
      include: {
        categories: true,
        links: true,
        videos: true
      }
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}