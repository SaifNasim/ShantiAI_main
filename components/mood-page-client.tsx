'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MoodSelector } from '@/components/mood-selector'
import { Smile, TrendingUp, Calendar, Plus, Check, Frown, Meh, SmilePlus, AlertCircle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MoodEntry {
  id: string
  mood: string
  note?: string
  created_at: string
}

const moodIcons: Record<string, { icon: LucideIcon; color: string }> = {
  sad: { icon: Frown, color: 'text-blue-400' },
  anxious: { icon: AlertCircle, color: 'text-orange-400' },
  neutral: { icon: Meh, color: 'text-yellow-400' },
  good: { icon: Smile, color: 'text-emerald-400' },
  great: { icon: SmilePlus, color: 'text-green-400' },
}

const moodValues: Record<string, number> = {
  sad: 1, anxious: 2, neutral: 3, good: 4, great: 5,
}

const moodColors: Record<string, string> = {
  sad: 'bg-red-500/20 text-red-400',
  anxious: 'bg-orange-500/20 text-orange-400',
  neutral: 'bg-yellow-500/20 text-yellow-400',
  good: 'bg-green-500/20 text-green-400',
  great: 'bg-emerald-500/20 text-emerald-400',
}

interface MoodPageClientProps {
  userId: string
  initialEntries: MoodEntry[]
}

export function MoodPageClient({ userId, initialEntries }: MoodPageClientProps) {
  const [entries, setEntries] = useState<MoodEntry[]>(initialEntries)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSaveMood = async () => {
    if (!selectedMood) return
    setSaving(true)
    const res = await fetch('/api/moods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: selectedMood, note: note || null }),
    })
    const data = await res.json()
    if (data?.id) {
      setEntries((prev) => [data, ...prev])
      setSelectedMood(null)
      setNote('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  // Calculate mood stats
  const avgMood = entries.length > 0
    ? (entries.reduce((sum, e) => sum + (moodValues[e.mood] || 3), 0) / entries.length).toFixed(1)
    : '0'
  const mostCommon = entries.length > 0
    ? Object.entries(entries.reduce<Record<string, number>>((acc, e) => {
        acc[e.mood] = (acc[e.mood] || 0) + 1
        return acc
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral'
    : 'neutral'

  // Simple bar chart data
  const last7 = entries.slice(0, 7).reverse()

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Mood Tracker</h1>
        <p className="text-muted-foreground">Track your emotional well-being over time</p>
      </div>

      {/* Log New Mood */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            How are you feeling right now?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MoodSelector value={selectedMood} onChange={setSelectedMood} />
          {selectedMood && (
            <div className="space-y-3 animate-fade-in">
              <Textarea
                placeholder="Add a note about what's on your mind (optional)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-input border-border resize-none"
                rows={3}
              />
              <Button onClick={handleSaveMood} disabled={saving} className="w-full bg-primary hover:bg-primary/90">
                {saved ? (
                  <><Check className="w-4 h-4 mr-2" /> Saved!</>
                ) : saving ? 'Saving...' : 'Log Mood'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{avgMood}</p>
            <p className="text-xs text-muted-foreground">Average Mood</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 text-center">
            {(() => { const m = moodIcons[mostCommon] || moodIcons.neutral; return <m.icon className={`w-6 h-6 mx-auto mb-1 ${m.color}`} /> })()}
            <p className="text-sm font-medium capitalize">{mostCommon}</p>
            <p className="text-xs text-muted-foreground">Most Common</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 text-center">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{entries.length}</p>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Chart (Simple bar visualization) */}
      {last7.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Recent Mood Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {last7.map((entry, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  {(() => { const m = moodIcons[entry.mood] || moodIcons.neutral; return <m.icon className={`w-5 h-5 ${m.color}`} /> })()}
                  <div
                    className="w-full rounded-t-md bg-primary/60 transition-all"
                    style={{ height: `${(moodValues[entry.mood] / 5) * 80}px` }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(entry.created_at), 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood History */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Mood History</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Smile className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No mood entries yet. Start tracking above!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-auto">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <span className={cn('p-2 rounded-lg', moodColors[entry.mood])}>
                    {(() => { const m = moodIcons[entry.mood] || moodIcons.neutral; return <m.icon className={`w-5 h-5 ${m.color}`} /> })()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{entry.mood}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), 'MMM d, yyyy · h:mm a')}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
