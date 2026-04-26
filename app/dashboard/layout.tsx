import { redirect } from 'next/navigation'
import { getSessionUserId } from '@/lib/auth'
import { getUserById, getProfile } from '@/lib/db'
import { DashboardShell } from '@/components/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userId = await getSessionUserId()
  if (!userId) redirect('/auth/login')

  const user = getUserById(userId)
  if (!user) redirect('/auth/login')

  const profile = getProfile(userId)

  return (
    <DashboardShell user={user} profile={profile || null}>
      {children}
    </DashboardShell>
  )
}
