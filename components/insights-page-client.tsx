'use client'

import { format, subDays, startOfDay, isSameDay } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Achievements } from '@/components/achievements'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  MessageCircle,
  Flame,
  Star,
  Trophy,
  Target,
  Clock,
  Frown,
  Meh,
  Smile,
  SmilePlus,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsightsPageClientProps {
  profile: {
    display_name: string | null
    total_points: number
    current_streak: number
    longest_streak: number
    level: number
  } | null
  moodEntries: { mood: string; created_at: string }[]
  chats: { id: string; created_at: string }[]
  pointsHistory: { points: number; reason: string; created_at: string }[]
}

const moodValues: Record<string, number> = {
  sad: 1, anxious: 2, neutral: 3, good: 4, great: 5,
}

const moodIcons: Record<string, { icon: LucideIcon; color: string }> = {
  sad: { icon: Frown, color: 'text-blue-400' },
  anxious: { icon: AlertCircle, color: 'text-orange-400' },
  neutral: { icon: Meh, color: 'text-yellow-400' },
  good: { icon: Smile, color: 'text-emerald-400' },
  great: { icon: SmilePlus, color: 'text-green-400' },
}

const moodLabels: Record<number, string> = {
  1: 'Sad', 2: 'Anxious', 3: 'Neutral', 4: 'Good', 5: 'Great',
}

export function InsightsPageClient({ profile, moodEntries, chats, pointsHistory }: InsightsPageClientProps) {
  // Activity heatmap - last 28 days
  const last28Days = Array.from({ length: 28 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 27 - i))
    const chatCount = chats.filter((c) => isSameDay(new Date(c.created_at), date)).length
    const moodCount = moodEntries.filter((m) => isSameDay(new Date(m.created_at), date)).length
    return { date, activity: chatCount + moodCount }
  })

  // Mood distribution
  const moodDist = moodEntries.reduce<Record<string, number>>((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1
    return acc
  }, {})
  const totalMoods = moodEntries.length

  // Weekly mood averages
  const weeklyMoods = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i))
    const dayMoods = moodEntries.filter((m) => isSameDay(new Date(m.created_at), date))
    const avg = dayMoods.length > 0
      ? dayMoods.reduce((sum, m) => sum + (moodValues[m.mood] || 3), 0) / dayMoods.length
      : 0
    return { date, avg, count: dayMoods.length }
  })

  // Session frequency
  const sessionsThisWeek = chats.filter((c) => {
    const d = new Date(c.created_at)
    return d >= subDays(new Date(), 7)
  }).length
  const sessionsLastWeek = chats.filter((c) => {
    const d = new Date(c.created_at)
    return d >= subDays(new Date(), 14) && d < subDays(new Date(), 7)
  }).length

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Insights & Analytics</h1>
        <p className="text-muted-foreground">Understanding your mental health journey</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="p-4 text-center">
            <Flame className="w-5 h-5 text-streak mx-auto mb-2" />
            <p className="text-2xl font-bold">{profile?.current_streak || 0}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 text-center">
            <Trophy className="w-5 h-5 text-level mx-auto mb-2" />
            <p className="text-2xl font-bold">{profile?.longest_streak || 0}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{chats.length}</p>
            <p className="text-xs text-muted-foreground">Total Sessions</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 text-center">
            <Star className="w-5 h-5 text-points mx-auto mb-2" />
            <p className="text-2xl font-bold">{profile?.total_points || 0}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Activity (Last 28 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <p key={d} className="text-[10px] text-muted-foreground text-center mb-1">{d}</p>
            ))}
            {last28Days.map((day, i) => (
              <div
                key={i}
                className={cn(
                  'aspect-square rounded-sm transition-colors',
                  day.activity === 0 && 'bg-muted/30',
                  day.activity === 1 && 'bg-primary/30',
                  day.activity === 2 && 'bg-primary/50',
                  day.activity >= 3 && 'bg-primary/80',
                )}
                title={`${format(day.date, 'MMM d')}: ${day.activity} activities`}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground">Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted/30" />
              <div className="w-3 h-3 rounded-sm bg-primary/30" />
              <div className="w-3 h-3 rounded-sm bg-primary/50" />
              <div className="w-3 h-3 rounded-sm bg-primary/80" />
            </div>
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Mood Chart */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Weekly Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-36">
              {weeklyMoods.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  {day.count > 0 && (
                    <span className="text-xs text-muted-foreground">{day.avg.toFixed(1)}</span>
                  )}
                  <div
                    className={cn(
                      'w-full rounded-t-md transition-all',
                      day.count > 0 ? 'bg-primary/60' : 'bg-muted/20'
                    )}
                    style={{ height: day.count > 0 ? `${(day.avg / 5) * 100}px` : '4px' }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {format(day.date, 'EEE')}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Frown className="w-3 h-3 text-blue-400" /> Sad</span>
              <span className="flex items-center gap-1"><SmilePlus className="w-3 h-3 text-green-400" /> Great</span>
            </div>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalMoods === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No mood data yet</p>
            ) : (
              <div className="space-y-3">
                {['great', 'good', 'neutral', 'anxious', 'sad'].map((mood) => {
                  const count = moodDist[mood] || 0
                  const pct = totalMoods > 0 ? (count / totalMoods) * 100 : 0
                  return (
                    <div key={mood} className="flex items-center gap-3">
                      <span className="w-8 flex justify-center">{(() => { const m = moodIcons[mood] || moodIcons.neutral; return <m.icon className={`w-5 h-5 ${m.color}`} /> })()}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs capitalize">{mood}</span>
                          <span className="text-xs text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Comparison */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Session Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/20">
              <p className="text-3xl font-bold text-primary">{sessionsThisWeek}</p>
              <p className="text-sm text-muted-foreground mt-1">This Week</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/20">
              <p className="text-3xl font-bold text-muted-foreground">{sessionsLastWeek}</p>
              <p className="text-sm text-muted-foreground mt-1">Last Week</p>
            </div>
          </div>
          {sessionsThisWeek > sessionsLastWeek ? (
            <p className="text-sm text-primary text-center mt-3">↑ You&apos;re more active this week! Keep it up!</p>
          ) : sessionsThisWeek < sessionsLastWeek ? (
            <p className="text-sm text-muted-foreground text-center mt-3">Remember: even a short check-in matters.</p>
          ) : (
            <p className="text-sm text-muted-foreground text-center mt-3">Consistent activity — great job!</p>
          )}
        </CardContent>
      </Card>

      {/* Points History */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Recent Points Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pointsHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No points earned yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-auto">
              {pointsHistory.slice(0, 15).map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-points" />
                    <span className="text-sm">{entry.reason}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-points">+{entry.points}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.created_at), 'MMM d')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      {profile && (
        <Achievements
          stats={{
            points: profile.total_points,
            streak: profile.current_streak,
            longestStreak: profile.longest_streak,
            sessionsCount: chats.length,
            moodEntries: moodEntries.length,
          }}
        />
      )}
    </div>
  )
}
