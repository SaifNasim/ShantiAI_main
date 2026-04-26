import { NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/auth'
import { createJournalEntry, updateJournalEntry, deleteJournalEntry, getJournalEntries, updateStreak, addPoints } from '@/lib/db'

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entries = getJournalEntries(userId)
  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content } = await req.json()
  const entry = createJournalEntry(userId, title, content)
  updateStreak(userId)
  addPoints(userId, 5, 'Wrote a journal entry')
  return NextResponse.json(entry)
}

export async function PATCH(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, title, content } = await req.json()
  const entry = updateJournalEntry(id, { title, content })
  return NextResponse.json(entry)
}

export async function DELETE(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  deleteJournalEntry(id)
  return NextResponse.json({ success: true })
}
