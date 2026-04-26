import { NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/auth'
import { createMoodEntry, getMoodEntries, updateStreak, addPoints } from '@/lib/db'

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entries = getMoodEntries(userId)
  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mood, note } = await req.json()
  const entry = createMoodEntry(userId, mood, note)
  updateStreak(userId)
  addPoints(userId, 3, 'Tracked your mood')
  return NextResponse.json(entry)
}
