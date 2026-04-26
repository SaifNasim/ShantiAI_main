'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PointsNotificationProps {
  points: number
  reason: string
  onComplete?: () => void
}

export function PointsNotification({ points, reason, onComplete }: PointsNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl glass animate-fade-in',
        'transition-all duration-500',
        !isVisible && 'opacity-0 translate-y-[-20px]'
      )}
    >
      <div className="p-2 rounded-full bg-points/20 animate-pulse-glow">
        <Star className="w-5 h-5 text-points" />
      </div>
      <div>
        <p className="font-semibold text-points">+{points} Points!</p>
        <p className="text-xs text-muted-foreground">{reason}</p>
      </div>
    </div>
  )
}
