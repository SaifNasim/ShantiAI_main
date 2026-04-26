import { NextResponse } from 'next/server'
import { getSessionUserId } from '@/lib/auth'
import { createMessage, getMessages } from '@/lib/db'

export async function GET(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const chatId = searchParams.get('chatId')
  if (!chatId) return NextResponse.json({ error: 'chatId required' }, { status: 400 })

  const messages = getMessages(chatId)
  return NextResponse.json(messages)
}

export async function POST(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { chat_id, role, content } = await req.json()
  const message = createMessage(chat_id, role, content)
  return NextResponse.json(message)
}
