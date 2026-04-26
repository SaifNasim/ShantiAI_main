import { getSessionUserId } from '@/lib/auth'
import { getMoodEntries } from '@/lib/db'
import { MoodPageClient } from '@/components/mood-page-client'

export default async function MoodPage() {
  const userId = await getSessionUserId()
  if (!userId) return null

  const moodEntries = getMoodEntries(userId, 50)

  return <MoodPageClient userId={userId} initialEntries={moodEntries} />
}
