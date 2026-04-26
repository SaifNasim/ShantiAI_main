import { getSessionUserId } from '@/lib/auth'
import { getProfile, getChats, getMoodEntries, getChatCount } from '@/lib/db'
import { DashboardHome } from '@/components/dashboard-home'

export default async function DashboardPage() {
  const userId = await getSessionUserId()
  if (!userId) return null

  const profile = getProfile(userId)
  const chats = getChats(userId, 5)
  const moodEntries = getMoodEntries(userId, 30)
  const recentMoods = getMoodEntries(userId, 7)
  const sessionsCount = getChatCount(userId)

  return (
    <DashboardHome
      profile={profile || null}
      recentChats={chats}
      moodEntries={moodEntries}
      recentMoods={recentMoods}
      sessionsCount={sessionsCount}
    />
  )
}
