import { getSessionUserId } from '@/lib/auth'
import { getJournalEntries } from '@/lib/db'
import { JournalPageClient } from '@/components/journal-page-client'

export default async function JournalPage() {
  const userId = await getSessionUserId()
  if (!userId) return null

  const entries = getJournalEntries(userId, 50)

  return <JournalPageClient userId={userId} initialEntries={entries} />
}
