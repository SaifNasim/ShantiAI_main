import { NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/auth'
import { getUserById, getProfile } from '@/lib/db'

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ user: null, profile: null })
  }

  const user = getUserById(userId)
  if (!user) {
    return NextResponse.json({ user: null, profile: null })
  }

  const profile = getProfile(userId)

  return NextResponse.json({
    user: { id: user.id, email: user.email, display_name: user.display_name },
    profile,
  })
}
