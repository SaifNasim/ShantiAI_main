'use client'

import { cn } from '@/lib/utils'
import { Frown, Meh, Smile, SmilePlus, AlertCircle } from 'lucide-react'

const moods = [
  { icon: Frown, label: 'Sad', value: 'sad', color: 'text-blue-400' },
  { icon: AlertCircle, label: 'Anxious', value: 'anxious', color: 'text-orange-400' },
  { icon: Meh, label: 'Neutral', value: 'neutral', color: 'text-yellow-400' },
  { icon: Smile, label: 'Good', value: 'good', color: 'text-emerald-400' },
  { icon: SmilePlus, label: 'Great', value: 'great', color: 'text-green-400' },
]

interface MoodSelectorProps {
  value: string | null
  onChange: (mood: string) => void
  label?: string
}

export function MoodSelector({ value, onChange, label }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      )}
      <div className="flex items-center justify-center gap-2">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onChange(mood.value)}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-xl transition-all',
              value === mood.value
                ? 'bg-primary/20 ring-2 ring-primary scale-110'
                : 'hover:bg-muted'
            )}
          >
            <mood.icon className={cn('w-7 h-7', mood.color)} />
            <span className="text-xs text-muted-foreground">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
