import { redirect } from 'next/navigation'
import { getSessionUserId } from '@/lib/auth'

export default async function Home() {
  const userId = await getSessionUserId()

  if (!userId) {
    redirect('/auth/login')
  }

  redirect('/dashboard')
}
