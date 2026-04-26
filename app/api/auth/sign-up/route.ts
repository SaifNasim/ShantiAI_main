import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createUser, getUserByEmail } from '@/lib/db'
import { setSessionCookie } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, password, displayName } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const existing = getUserByEmail(email)
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = createUser(email, passwordHash, displayName || email.split('@')[0])

  await setSessionCookie(user.id)

  return NextResponse.json({ user: { id: user.id, email: user.email, display_name: user.display_name } })
}
