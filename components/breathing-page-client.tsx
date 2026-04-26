'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wind, Play, Pause, RotateCcw, Timer, Heart, Brain, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Exercise {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  inhale: number
  hold: number
  exhale: number
  holdAfter?: number
  cycles: number
  color: string
}

const exercises: Exercise[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal timing for inhale, hold, exhale, and hold. Used by Navy SEALs for stress relief.',
    icon: Wind,
    inhale: 4, hold: 4, exhale: 4, holdAfter: 4,
    cycles: 4,
    color: 'text-cyan-400',
  },
  {
    id: '478',
    name: '4-7-8 Technique',
    description: 'Dr. Andrew Weil\'s relaxing breath. Helps with anxiety and falling asleep.',
    icon: Moon,
    inhale: 4, hold: 7, exhale: 8,
    cycles: 4,
    color: 'text-purple-400',
  },
  {
    id: 'calm',
    name: 'Calming Breath',
    description: 'Simple deep breathing to activate the parasympathetic nervous system.',
    icon: Heart,
    inhale: 4, hold: 2, exhale: 6,
    cycles: 6,
    color: 'text-primary',
  },
  {
    id: 'energize',
    name: 'Energizing Breath',
    description: 'Short, powerful breaths to increase alertness and energy.',
    icon: Brain,
    inhale: 2, hold: 0, exhale: 2,
    cycles: 10,
    color: 'text-yellow-400',
  },
]

type Phase = 'inhale' | 'hold' | 'exhale' | 'holdAfter' | 'idle'

export function BreathingPageClient() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(exercises[0])
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [timer, setTimer] = useState(0)
  const [currentCycle, setCurrentCycle] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const phaseRef = useRef<Phase>('idle')
  const timerRef = useRef(0)
  const cycleRef = useRef(0)

  const getPhaseLabel = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In'
      case 'hold': return 'Hold'
      case 'exhale': return 'Breathe Out'
      case 'holdAfter': return 'Hold'
      default: return 'Ready'
    }
  }

  const getPhaseTime = (p: Phase) => {
    switch (p) {
      case 'inhale': return selectedExercise.inhale
      case 'hold': return selectedExercise.hold
      case 'exhale': return selectedExercise.exhale
      case 'holdAfter': return selectedExercise.holdAfter || 0
      default: return 0
    }
  }

  const getNextPhase = (current: Phase): Phase | 'done' => {
    switch (current) {
      case 'inhale': return selectedExercise.hold > 0 ? 'hold' : 'exhale'
      case 'hold': return 'exhale'
      case 'exhale': return selectedExercise.holdAfter ? 'holdAfter' : 'inhale'
      case 'holdAfter': return 'inhale'
      default: return 'inhale'
    }
  }

  const startExercise = () => {
    setIsActive(true)
    setPhase('inhale')
    phaseRef.current = 'inhale'
    setTimer(selectedExercise.inhale)
    timerRef.current = selectedExercise.inhale
    setCurrentCycle(1)
    cycleRef.current = 1
    setTotalSeconds(0)

    intervalRef.current = setInterval(() => {
      setTotalSeconds((prev) => prev + 1)
      timerRef.current -= 1
      setTimer(timerRef.current)

      if (timerRef.current <= 0) {
        const next = getNextPhase(phaseRef.current)
        if (next === 'inhale') {
          if (cycleRef.current >= selectedExercise.cycles) {
            // Done
            stopExercise()
            return
          }
          cycleRef.current += 1
          setCurrentCycle(cycleRef.current)
        }
        if (next === 'done') {
          stopExercise()
          return
        }
        phaseRef.current = next as Phase
        setPhase(next as Phase)
        const t = getPhaseTime(next as Phase)
        timerRef.current = t
        setTimer(t)
      }
    }, 1000)
  }

  const stopExercise = () => {
    setIsActive(false)
    setPhase('idle')
    phaseRef.current = 'idle'
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const resetExercise = () => {
    stopExercise()
    setTimer(0)
    setCurrentCycle(0)
    setTotalSeconds(0)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const getCircleScale = () => {
    if (phase === 'inhale') return 'scale-110'
    if (phase === 'exhale') return 'scale-75'
    return 'scale-100'
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Breathing Exercises</h1>
        <p className="text-muted-foreground">Calm your mind with guided breathing techniques</p>
      </div>

      {/* Exercise Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {exercises.map((ex) => (
          <Card
            key={ex.id}
            className={cn(
              'glass cursor-pointer transition-all hover:scale-[1.02]',
              selectedExercise.id === ex.id ? 'border-primary/50 bg-primary/5' : 'border-border/50'
            )}
            onClick={() => { if (!isActive) { setSelectedExercise(ex); resetExercise() } }}
          >
            <CardContent className="p-4 text-center">
              <ex.icon className={cn('w-6 h-6 mx-auto mb-2', ex.color)} />
              <p className="text-sm font-medium">{ex.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {ex.inhale}-{ex.hold}-{ex.exhale}{ex.holdAfter ? `-${ex.holdAfter}` : ''}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Breathing Animation */}
      <Card className="glass border-border/50">
        <CardContent className="p-8">
          <div className="flex flex-col items-center">
            {/* Circle Animation */}
            <div className="relative mb-8">
              <div
                className={cn(
                  'w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-1000',
                  phase === 'idle' ? 'border-border' : 'border-primary',
                  isActive && getCircleScale(),
                  isActive && phase === 'inhale' && 'bg-primary/10',
                  isActive && phase === 'exhale' && 'bg-primary/5',
                  isActive && (phase === 'hold' || phase === 'holdAfter') && 'bg-primary/15',
                )}
              >
                <div className="text-center">
                  <p className={cn(
                    'text-2xl font-bold transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {isActive ? timer : '0'}
                  </p>
                  <p className={cn(
                    'text-sm font-medium',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {getPhaseLabel()}
                  </p>
                </div>
              </div>
              {/* Pulse rings */}
              {isActive && phase === 'inhale' && (
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
              )}
            </div>

            {/* Info */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold">{selectedExercise.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{selectedExercise.description}</p>
              {isActive && (
                <div className="flex items-center justify-center gap-4 mt-3 text-sm">
                  <span className="text-muted-foreground">
                    Cycle {currentCycle}/{selectedExercise.cycles}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    {Math.floor(totalSeconds / 60)}:{String(totalSeconds % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {!isActive ? (
                <Button onClick={startExercise} className="bg-primary hover:bg-primary/90 px-8">
                  <Play className="w-4 h-4 mr-2" /> Start
                </Button>
              ) : (
                <Button onClick={stopExercise} variant="outline" className="px-8">
                  <Pause className="w-4 h-4 mr-2" /> Stop
                </Button>
              )}
              <Button variant="ghost" onClick={resetExercise} disabled={!isActive && totalSeconds === 0}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Breathing Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Find a comfortable sitting position with your back straight
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Breathe through your nose for inhaling, and through your mouth for exhaling
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Focus on the sensation of air entering and leaving your body
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              If your mind wanders, gently bring your attention back to your breath
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Practice regularly for best results — even 2 minutes daily makes a difference
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
