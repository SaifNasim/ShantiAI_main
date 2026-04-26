import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail, updateStreak } from '@/lib/db'
import { setSessionCookie } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const user = getUserByEmail(email)
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  await setSessionCookie(user.id)
  updateStreak(user.id)

  return NextResponse.json({ user: { id: user.id, email: user.email, display_name: user.display_name } })
}
