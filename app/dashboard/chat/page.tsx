import { getSessionUserId } from '@/lib/auth'
import { getUserById, getProfile, getChats, getMoodEntries } from '@/lib/db'
import { ChatPageClient } from '@/components/chat-page-client'

export default async function ChatPage() {
  const userId = await getSessionUserId()
  if (!userId) return null

  const user = getUserById(userId)
  if (!user) return null

  const profile = getProfile(userId)
  const chats = getChats(userId)
  const moodEntries = getMoodEntries(userId)

  return (
    <ChatPageClient
      user={{ id: user.id, email: user.email, display_name: user.display_name }}
      profile={profile ? {
        display_name: profile.display_name,
        total_points: profile.total_points,
        current_streak: profile.current_streak,
        longest_streak: profile.longest_streak,
        level: profile.level,
      } : null}
      initialChats={chats}
      moodEntriesCount={moodEntries.length}
    />
  )
}
