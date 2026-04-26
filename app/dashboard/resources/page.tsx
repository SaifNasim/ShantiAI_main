import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Phone,
  MessageCircle,
  Globe,
  Heart,
  Shield,
  AlertTriangle,
  ExternalLink,
  BookOpen,
} from 'lucide-react'

const crisisLines = [
  {
    name: 'Emergency Helpline (Police)',
    number: '999',
    description: 'National emergency police response line.',
    available: '24/7',
    type: 'Call',
  },
  {
    name: 'RAB HelpDesk',
    number: '101',
    description: 'Rapid Action Battalion helpdesk for urgent assistance.',
    available: '24/7',
    type: 'Call',
  },
  {
    name: 'Women and Children Abuse',
    number: '109',
    description: 'Dedicated helpline for women and children facing abuse.',
    available: '24/7',
    type: 'Call',
  },
  {
    name: 'Kaan Pete Roi',
    number: '09612-119911',
    description: 'Emotional support helpline for Bengali speakers. Alt: 01779554391, 01779554392 (Grameenphone).',
    available: '24/7',
    type: 'Call',
  },
  {
    name: 'Government Legal Assistance',
    number: '16430',
    description: 'Free legal aid and assistance provided by the government.',
    available: '24/7',
    type: 'Call',
  },
]

const selfCareStrategies = [
  {
    title: 'Grounding Technique (5-4-3-2-1)',
    description: 'Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
    icon: Shield,
  },
  {
    title: 'Box Breathing',
    description: 'Breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Repeat.',
    icon: Heart,
  },
  {
    title: 'Safe Place Visualization',
    description: 'Close your eyes and imagine a place where you feel completely safe and at peace.',
    icon: Globe,
  },
  {
    title: 'Progressive Muscle Relaxation',
    description: 'Tense each muscle group for 5 seconds then release, starting from your toes to your head.',
    icon: BookOpen,
  },
]

const warningSignsInfo = [
  'Talking about wanting to die or feeling hopeless',
  'Increasing use of alcohol or drugs',
  'Withdrawing from friends, family, and activities',
  'Extreme mood swings or changes in behavior',
  'Sleeping too much or too little',
  'Giving away prized possessions',
  'Feeling trapped or like a burden to others',
]

export default function ResourcesPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Crisis Resources</h1>
        <p className="text-muted-foreground">Help is always available. You are not alone.</p>
      </div>

      {/* Emergency Banner */}
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">If you are in immediate danger</p>
              <p className="text-sm text-muted-foreground mt-1">
                Call <strong>911</strong> (US) or your local emergency number immediately.
                If you&apos;re having thoughts of suicide, call or text <strong>988</strong> now.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crisis Hotlines */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          Crisis Hotlines
        </h2>
        <div className="grid gap-3">
          {crisisLines.map((line) => (
            <Card key={line.name} className="glass border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm">{line.name}</h3>
                      <Badge variant="outline" className="text-[10px]">{line.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{line.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Available: {line.available}</p>
                  </div>
                  <div className="shrink-0">
                    <p className="text-sm font-bold text-primary">{line.number}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Warning Signs */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Warning Signs to Watch For
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {warningSignsInfo.map((sign, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-yellow-500 mt-0.5 shrink-0">•</span>
                {sign}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">
            If you notice these signs in yourself or someone else, please reach out to a crisis line or mental health professional.
          </p>
        </CardContent>
      </Card>

      {/* Self-Care Strategies */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Coping Strategies
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {selfCareStrategies.map((strategy) => (
            <Card key={strategy.title} className="glass border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <strategy.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{strategy.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{strategy.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reminder */}
      <Card className="glass border-primary/20">
        <CardContent className="p-6 text-center">
          <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Remember</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Shanti AI is an AI companion and not a substitute for professional mental health care.
            If you&apos;re experiencing a mental health crisis, please contact one of the resources above
            or speak with a licensed professional.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
