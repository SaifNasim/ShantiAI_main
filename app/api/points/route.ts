import { NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/auth'
import { addPoints, getPointsHistory, getProfile, updateStreak } from '@/lib/db'

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const history = getPointsHistory(userId)
  return NextResponse.json(history)
}

export async function POST(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { points, reason } = await req.json()
  addPoints(userId, points, reason)
  
  const profile = getProfile(userId)
  return NextResponse.json({ profile })
}
