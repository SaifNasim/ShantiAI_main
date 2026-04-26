import { NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/auth'
import { updateStreak, getProfile } from '@/lib/db'

export async function POST() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  updateStreak(userId)
  const profile = getProfile(userId)
  return NextResponse.json({ profile })
}
