'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Plus, Trash2, Edit3, Check, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood?: string
  tags?: string[]
  created_at: string
}

const prompts = [
  "What are you grateful for today?",
  "What was the highlight of your day?",
  "What's been on your mind lately?",
  "What would make today great?",
  "Describe a moment that made you smile recently.",
  "What's one thing you'd like to let go of?",
  "What does self-care look like for you today?",
  "Write about a challenge you overcame.",
]

interface JournalPageClientProps {
  userId: string
  initialEntries: JournalEntry[]
}

export function JournalPageClient({ userId, initialEntries }: JournalPageClientProps) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)
  const [isWriting, setIsWriting] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    const entryTitle = title.trim() || format(new Date(), 'MMMM d, yyyy')

    if (editingId) {
      const res = await fetch('/api/journal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, title: entryTitle, content }),
      })
      const data = await res.json()
      if (data?.id) {
        setEntries((prev) => prev.map((e) => e.id === editingId ? data : e))
      }
      setEditingId(null)
    } else {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: entryTitle, content }),
      })
      const data = await res.json()
      if (data?.id) {
        setEntries((prev) => [data, ...prev])
      }
    }

    setTitle('')
    setContent('')
    setIsWriting(false)
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/journal', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const handleEdit = (entry: JournalEntry) => {
    setTitle(entry.title)
    setContent(entry.content)
    setEditingId(entry.id)
    setIsWriting(true)
  }

  const usePrompt = (prompt: string) => {
    setContent(prompt + '\n\n')
    setIsWriting(true)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-muted-foreground">Express your thoughts and reflect on your journey</p>
        </div>
        {!isWriting && (
          <Button onClick={() => setIsWriting(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> New Entry
          </Button>
        )}
      </div>

      {/* Writing Area */}
      {isWriting && (
        <Card className="glass border-primary/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-primary" />
              {editingId ? 'Edit Entry' : 'New Journal Entry'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Entry title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border"
            />
            <Textarea
              placeholder="Write your thoughts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-input border-border resize-none min-h-[200px]"
              rows={8}
            />
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => { setIsWriting(false); setEditingId(null); setTitle(''); setContent('') }}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={!content.trim() || saving} className="bg-primary hover:bg-primary/90">
                <Check className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : editingId ? 'Update' : 'Save Entry'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Writing Prompts */}
      {!isWriting && entries.length === 0 && (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Writing Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => usePrompt(prompt)}
                  className="text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompts (collapsed when entries exist) */}
      {!isWriting && entries.length > 0 && (
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              {prompts.slice(0, 4).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => usePrompt(prompt)}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-muted/30 hover:bg-muted/50 border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journal Entries */}
      {entries.length === 0 && !isWriting ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg mb-1">Your journal is empty</p>
          <p className="text-sm">Start writing to express your thoughts and feelings</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="glass border-border/50 hover:border-border transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{entry.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className={cn(
                      'text-sm text-muted-foreground whitespace-pre-wrap',
                      expandedId !== entry.id && 'line-clamp-2'
                    )}>
                      {entry.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(entry)}>
                      <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
