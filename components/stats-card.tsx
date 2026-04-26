'use client'

import { Flame, Star, Trophy, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  points: number
  streak: number
  longestStreak: number
  level: number
  compact?: boolean
}

export function StatsCard({ points, streak, longestStreak, level, compact = false }: StatsCardProps) {
  const levelProgress = (points % 100) / 100
  const pointsToNextLevel = 100 - (points % 100)

  if (compact) {
    return (
      <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-card/50">
        <div className="flex items-center gap-1.5">
          <div className={cn("p-1 rounded-full bg-streak/20", streak > 0 && "animate-streak")}>
            <Flame className="w-4 h-4 text-streak" />
          </div>
          <span className="text-sm font-medium">{streak}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-full bg-points/20">
            <Star className="w-4 h-4 text-points" />
          </div>
          <span className="text-sm font-medium">{points}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-full bg-level/20">
            <Trophy className="w-4 h-4 text-level" />
          </div>
          <span className="text-sm font-medium">Lv.{level}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Your Progress</h3>
      
      {/* Level Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-level" />
            <span className="font-semibold">Level {level}</span>
          </div>
          <span className="text-xs text-muted-foreground">{pointsToNextLevel} pts to next</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-points to-level rounded-full transition-all duration-500"
            style={{ width: `${levelProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-streak/10 border border-streak/20">
          <div className={cn("inline-flex p-2 rounded-full bg-streak/20 mb-2", streak > 0 && "animate-streak")}>
            <Flame className="w-5 h-5 text-streak" />
          </div>
          <p className="text-2xl font-bold text-streak">{streak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-points/10 border border-points/20">
          <div className="inline-flex p-2 rounded-full bg-points/20 mb-2">
            <Star className="w-5 h-5 text-points" />
          </div>
          <p className="text-2xl font-bold text-points">{points}</p>
          <p className="text-xs text-muted-foreground">Total Points</p>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-level/10 border border-level/20">
          <div className="inline-flex p-2 rounded-full bg-level/20 mb-2">
            <TrendingUp className="w-5 h-5 text-level" />
          </div>
          <p className="text-2xl font-bold text-level">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </div>
      </div>
    </div>
  )
}
