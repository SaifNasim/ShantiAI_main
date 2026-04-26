import crypto from 'crypto'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'shanti_ai_session'
const SECRET = process.env.SESSION_SECRET || 'shanti-ai-default-secret-change-in-production'

// Simple HMAC-based session token: userId.timestamp.signature
export function createSessionToken(userId: string): string {
  const timestamp = Date.now().toString()
  const payload = `${userId}.${timestamp}`
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  return `${payload}.${signature}`
}

export function verifySessionToken(token: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [userId, timestamp, signature] = parts
  const payload = `${userId}.${timestamp}`
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')

  if (signature !== expected) return null

  // Token expires after 30 days
  const age = Date.now() - parseInt(timestamp)
  if (age > 30 * 24 * 60 * 60 * 1000) return null

  return userId
}

export async function setSessionCookie(userId: string) {
  const token = createSessionToken(userId)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  })
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
