import { NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/auth'
import { createChat, getChats, updateChat, deleteChat, updateStreak, addPoints } from '@/lib/db'

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chats = getChats(userId)
  return NextResponse.json(chats)
}

export async function POST(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, mood_before } = await req.json()
  const chat = createChat(userId, title || 'New Session', mood_before)
  updateStreak(userId)
  addPoints(userId, 5, 'Started a new session')
  return NextResponse.json(chat)
}

export async function PATCH(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...data } = await req.json()
  updateChat(id, data)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  deleteChat(id)
  return NextResponse.json({ success: true })
}
