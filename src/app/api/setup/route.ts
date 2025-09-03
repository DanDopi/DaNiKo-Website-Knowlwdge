import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByUsername } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const existingUser = await getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const user = await createUser(username, password)
    
    return NextResponse.json({ 
      message: 'User created successfully',
      username: user.username 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Setup endpoint - use POST to create a user',
    instructions: 'Send POST request with { "username": "your-username", "password": "your-password" }'
  })
}