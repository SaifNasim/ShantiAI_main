import { getSessionUserId } from '@/lib/auth'
import { getProfile, getMoodEntries, getChats, getPointsHistory } from '@/lib/db'
import { InsightsPageClient } from '@/components/insights-page-client'

export default async function InsightsPage() {
  const userId = await getSessionUserId()
  if (!userId) return null

  const profile = getProfile(userId)
  const moodEntries = getMoodEntries(userId, 100)
  const chats = getChats(userId, 100)
  const pointsHistory = getPointsHistory(userId, 50)

  return (
    <InsightsPageClient
      profile={profile || null}
      moodEntries={moodEntries}
      chats={chats}
      pointsHistory={pointsHistory}
    />
  )
}
