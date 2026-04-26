'use client'

import { Award, Lock, Flame, MessageSquare, Calendar, Heart, Star, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

const achievementsList: Achievement[] = [
  {
    id: 'first-chat',
    name: 'First Step',
    description: 'Complete your first session',
    icon: MessageSquare,
    unlocked: false,
  },
  {
    id: 'streak-3',
    name: 'Consistent',
    description: 'Maintain a 3-day streak',
    icon: Flame,
    unlocked: false,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: Calendar,
    unlocked: false,
  },
  {
    id: 'points-100',
    name: 'Rising Star',
    description: 'Earn 100 points',
    icon: Star,
    unlocked: false,
  },
  {
    id: 'points-500',
    name: 'Dedicated',
    description: 'Earn 500 points',
    icon: Trophy,
    unlocked: false,
  },
  {
    id: 'mood-tracker',
    name: 'Self-Aware',
    description: 'Track your mood 10 times',
    icon: Heart,
    unlocked: false,
  },
]

interface AchievementsProps {
  unlockedBadges?: string[]
  stats?: {
    points: number
    streak: number
    longestStreak: number
    sessionsCount: number
    moodEntries: number
  }
}

export function Achievements({ unlockedBadges = [], stats }: AchievementsProps) {
  const achievements = achievementsList.map((achievement) => {
    let unlocked = unlockedBadges.includes(achievement.id)
    let progress = 0
    let maxProgress = 1

    if (stats) {
      switch (achievement.id) {
        case 'first-chat':
          unlocked = stats.sessionsCount >= 1
          break
        case 'streak-3':
          progress = Math.min(stats.longestStreak, 3)
          maxProgress = 3
          unlocked = stats.longestStreak >= 3
          break
        case 'streak-7':
          progress = Math.min(stats.longestStreak, 7)
          maxProgress = 7
          unlocked = stats.longestStreak >= 7
          break
        case 'points-100':
          progress = Math.min(stats.points, 100)
          maxProgress = 100
          unlocked = stats.points >= 100
          break
        case 'points-500':
          progress = Math.min(stats.points, 500)
          maxProgress = 500
          unlocked = stats.points >= 500
          break
        case 'mood-tracker':
          progress = Math.min(stats.moodEntries, 10)
          maxProgress = 10
          unlocked = stats.moodEntries >= 10
          break
      }
    }

    return { ...achievement, unlocked, progress, maxProgress }
  })

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="glass rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Achievements</h3>
        <span className="text-xs text-muted-foreground">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {achievements.map((achievement) => {
          const Icon = achievement.icon
          return (
            <div
              key={achievement.id}
              className={cn(
                'relative flex flex-col items-center p-3 rounded-lg text-center transition-all',
                achievement.unlocked
                  ? 'bg-primary/10 border border-primary/30'
                  : 'bg-muted/50 opacity-60'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-full mb-2',
                  achievement.unlocked ? 'bg-primary/20' : 'bg-muted'
                )}
              >
                {achievement.unlocked ? (
                  <Icon className="w-5 h-5 text-primary" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs font-medium truncate w-full">{achievement.name}</p>
              {!achievement.unlocked && achievement.maxProgress && achievement.maxProgress > 1 && (
                <div className="w-full mt-2">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/50 rounded-full"
                      style={{
                        width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {achievement.progress}/{achievement.maxProgress}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
