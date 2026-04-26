'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatsCard } from '@/components/stats-card'
import { Achievements } from '@/components/achievements'
import {
  Handshake,
  MessageCircle,
  Smile,
  BookOpen,
  Wind,
  Phone,
  ArrowRight,
  Flame,
  Star,
  Trophy,
  TrendingUp,
  Sparkles,
  Brain,
  Shield,
  Frown,
  Meh,
  SmilePlus,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react'

interface DashboardHomeProps {
  profile: {
    display_name: string | null
    total_points: number
    current_streak: number
    longest_streak: number
    level: number
  } | null
  recentChats: { id: string; title: string; created_at: string }[]
  moodEntries: { id: string; mood: string; created_at: string; note?: string }[]
  recentMoods: { mood: string; created_at: string }[]
  sessionsCount: number
}

const moodIcons: Record<string, { icon: LucideIcon; color: string }> = {
  sad: { icon: Frown, color: 'text-blue-400' },
  anxious: { icon: AlertCircle, color: 'text-orange-400' },
  neutral: { icon: Meh, color: 'text-yellow-400' },
  good: { icon: Smile, color: 'text-emerald-400' },
  great: { icon: SmilePlus, color: 'text-green-400' },
}

const quickActions = [
  { href: '/dashboard/chat', icon: MessageCircle, label: 'Talk to Shanti AI', description: 'Start a support session', color: 'text-primary' },
  { href: '/dashboard/mood', icon: Smile, label: 'Track Mood', description: 'Log how you feel', color: 'text-yellow-500' },
  { href: '/dashboard/journal', icon: BookOpen, label: 'Write Journal', description: 'Express your thoughts', color: 'text-blue-400' },
  { href: '/dashboard/breathing', icon: Wind, label: 'Breathing', description: 'Calm your mind', color: 'text-cyan-400' },
]

export function DashboardHome({ profile, recentChats, moodEntries, recentMoods, sessionsCount }: DashboardHomeProps) {
  const greeting = getGreeting()
  const name = profile?.display_name || 'there'

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold">
          {greeting}, <span className="gradient-text">{name}</span> <Handshake className="inline w-7 h-7 text-primary" />
        </h1>
        <p className="text-muted-foreground">How are you feeling today? Let&apos;s take care of your mental health.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-streak/20">
              <Flame className="w-5 h-5 text-streak" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile?.current_streak || 0}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-points/20">
              <Star className="w-5 h-5 text-points" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile?.total_points || 0}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-level/20">
              <Trophy className="w-5 h-5 text-level" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile?.level || 1}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sessionsCount}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      {profile && (
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-level" />
                <span className="text-sm font-medium">Level {profile.level}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {100 - (profile.total_points % 100)} pts to Level {profile.level + 1}
              </span>
            </div>
            <Progress value={(profile.total_points % 100)} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="glass border-border/50 hover:border-primary/30 transition-all hover:scale-[1.02] cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-xl bg-card border border-border/50">
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Mood */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Moods</CardTitle>
              <Link href="/dashboard/mood">
                <Button variant="ghost" size="sm" className="text-primary text-xs">
                  View All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentMoods.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Smile className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No mood entries yet</p>
                <Link href="/dashboard/mood">
                  <Button size="sm" variant="outline" className="mt-2">Track your mood</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentMoods.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      {(() => { const m = moodIcons[entry.mood] || moodIcons.neutral; return <m.icon className={`w-5 h-5 ${m.color}`} /> })()}
                      <span className="text-sm capitalize">{entry.mood}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Sessions</CardTitle>
              <Link href="/dashboard/chat">
                <Button variant="ghost" size="sm" className="text-primary text-xs">
                  New Chat <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentChats.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <Link href="/dashboard/chat">
                  <Button size="sm" variant="outline" className="mt-2">Start a session</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentChats.map((chat) => (
                  <Link key={chat.id} href="/dashboard/chat">
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <MessageCircle className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm truncate">{chat.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {format(new Date(chat.created_at), 'MMM d')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      {profile && (
        <Achievements
          stats={{
            points: profile.total_points,
            streak: profile.current_streak,
            longestStreak: profile.longest_streak,
            sessionsCount,
            moodEntries: moodEntries.length,
          }}
        />
      )}

      {/* Daily Tips */}
      <Card className="glass border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Daily Wellness Tip</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getDailyTip()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDailyTip() {
  const tips = [
    "Take a few deep breaths right now. Inhale for 4 counts, hold for 4, exhale for 6. This activates your parasympathetic nervous system and helps reduce stress.",
    "Try the 5-4-3-2-1 grounding technique: Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
    "Remember: it's okay to not be okay. Acknowledging your feelings is the first step toward healing.",
    "Stay hydrated! Dehydration can affect your mood and cognitive function. Try to drink a glass of water right now.",
    "Practice gratitude by writing down 3 things you're thankful for today. This simple habit can rewire your brain for positivity.",
    "Movement is medicine for the mind. Even a 10-minute walk can boost your mood significantly.",
    "Set boundaries without guilt. Saying 'no' to others can mean saying 'yes' to your well-being.",
  ]
  const dayIndex = new Date().getDate() % tips.length
  return tips[dayIndex]
}
