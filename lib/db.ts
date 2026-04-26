import Database from 'better-sqlite3'
import path from 'path'
import crypto from 'crypto'

const DB_PATH = path.join(process.cwd(), 'data', 'shanti-ai.db')

// Ensure data directory exists
import fs from 'fs'
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(DB_PATH)

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    last_activity_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Session',
    mood_before TEXT,
    points_earned INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS mood_entries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood TEXT NOT NULL,
    note TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled',
    content TEXT NOT NULL,
    mood TEXT,
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS points_history (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
  CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
  CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
`)

function generateId(): string {
  return crypto.randomBytes(16).toString('hex')
}

// ─── User / Auth ──────────────────────────────────────────
export function createUser(email: string, passwordHash: string, displayName: string) {
  const id = generateId()
  db.prepare('INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)').run(id, email, passwordHash, displayName)
  db.prepare('INSERT INTO profiles (id, display_name) VALUES (?, ?)').run(id, displayName)
  return { id, email, display_name: displayName }
}

export function getUserByEmail(email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as { id: string; email: string; password_hash: string; display_name: string } | undefined
}

export function getUserById(id: string) {
  return db.prepare('SELECT id, email, display_name, created_at FROM users WHERE id = ?').get(id) as { id: string; email: string; display_name: string; created_at: string } | undefined
}

// ─── Profiles ──────────────────────────────────────────
export function getProfile(userId: string) {
  return db.prepare('SELECT * FROM profiles WHERE id = ?').get(userId) as {
    id: string; display_name: string | null; total_points: number; current_streak: number; longest_streak: number; level: number; last_activity_date: string | null
  } | undefined
}

export function updateProfile(userId: string, data: Partial<{ display_name: string; total_points: number; level: number; current_streak: number; longest_streak: number; last_activity_date: string }>) {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ')
  const values = Object.values(data)
  db.prepare(`UPDATE profiles SET ${fields} WHERE id = ?`).run(...values, userId)
}

// ─── Streak ──────────────────────────────────────────
export function updateStreak(userId: string) {
  const profile = getProfile(userId)
  if (!profile) return

  const today = new Date().toISOString().split('T')[0]
  const lastDate = profile.last_activity_date

  if (lastDate === today) return // Already updated today

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  let newStreak = 1
  if (lastDate === yesterday) {
    newStreak = profile.current_streak + 1
  }

  const longestStreak = Math.max(profile.longest_streak, newStreak)
  db.prepare('UPDATE profiles SET current_streak = ?, longest_streak = ?, last_activity_date = ? WHERE id = ?').run(newStreak, longestStreak, today, userId)
}

// ─── Chats ──────────────────────────────────────────
export function createChat(userId: string, title: string, moodBefore?: string) {
  const id = generateId()
  db.prepare('INSERT INTO chats (id, user_id, title, mood_before) VALUES (?, ?, ?, ?)').run(id, userId, title, moodBefore || null)
  return { id, user_id: userId, title, mood_before: moodBefore || null, points_earned: 0, created_at: new Date().toISOString() }
}

export function getChats(userId: string, limit = 50) {
  return db.prepare('SELECT * FROM chats WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(userId, limit) as Array<{
    id: string; user_id: string; title: string; mood_before: string | null; points_earned: number; created_at: string
  }>
}

export function getChatCount(userId: string): number {
  const row = db.prepare('SELECT COUNT(*) as count FROM chats WHERE user_id = ?').get(userId) as { count: number }
  return row.count
}

export function updateChat(chatId: string, data: Partial<{ title: string; points_earned: number }>) {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ')
  const values = Object.values(data)
  db.prepare(`UPDATE chats SET ${fields} WHERE id = ?`).run(...values, chatId)
}

export function deleteChat(chatId: string) {
  db.prepare('DELETE FROM chats WHERE id = ?').run(chatId)
}

// ─── Messages ──────────────────────────────────────────
export function createMessage(chatId: string, role: 'user' | 'assistant', content: string) {
  const id = generateId()
  db.prepare('INSERT INTO messages (id, chat_id, role, content) VALUES (?, ?, ?, ?)').run(id, chatId, role, content)
  return { id, chat_id: chatId, role, content, created_at: new Date().toISOString() }
}

export function getMessages(chatId: string) {
  return db.prepare('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC').all(chatId) as Array<{
    id: string; chat_id: string; role: string; content: string; created_at: string
  }>
}

// ─── Mood Entries ──────────────────────────────────────────
export function createMoodEntry(userId: string, mood: string, note?: string) {
  const id = generateId()
  db.prepare('INSERT INTO mood_entries (id, user_id, mood, note) VALUES (?, ?, ?, ?)').run(id, userId, mood, note || null)
  return { id, user_id: userId, mood, note: note || null, created_at: new Date().toISOString() }
}

export function getMoodEntries(userId: string, limit = 50) {
  return db.prepare('SELECT * FROM mood_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(userId, limit) as Array<{
    id: string; user_id: string; mood: string; note: string | null; created_at: string
  }>
}

// ─── Journal Entries ──────────────────────────────────────────
export function createJournalEntry(userId: string, title: string, content: string) {
  const id = generateId()
  db.prepare('INSERT INTO journal_entries (id, user_id, title, content) VALUES (?, ?, ?, ?)').run(id, userId, title, content)
  return { id, user_id: userId, title, content, mood: null, tags: '[]', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
}

export function updateJournalEntry(entryId: string, data: { title: string; content: string }) {
  db.prepare('UPDATE journal_entries SET title = ?, content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(data.title, data.content, entryId)
  return db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(entryId)
}

export function deleteJournalEntry(entryId: string) {
  db.prepare('DELETE FROM journal_entries WHERE id = ?').run(entryId)
}

export function getJournalEntries(userId: string, limit = 50) {
  return db.prepare('SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(userId, limit) as Array<{
    id: string; user_id: string; title: string; content: string; mood: string | null; tags: string; created_at: string; updated_at: string
  }>
}

// ─── Points ──────────────────────────────────────────
export function addPoints(userId: string, points: number, reason: string) {
  const id = generateId()
  db.prepare('INSERT INTO points_history (id, user_id, points, reason) VALUES (?, ?, ?, ?)').run(id, userId, points, reason)
  const profile = getProfile(userId)
  if (profile) {
    const newTotal = profile.total_points + points
    const newLevel = Math.floor(newTotal / 100) + 1
    db.prepare('UPDATE profiles SET total_points = ?, level = ? WHERE id = ?').run(newTotal, newLevel, userId)
  }
}

export function getPointsHistory(userId: string, limit = 50) {
  return db.prepare('SELECT * FROM points_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(userId, limit) as Array<{
    id: string; user_id: string; points: number; reason: string; created_at: string
  }>
}

export default db
