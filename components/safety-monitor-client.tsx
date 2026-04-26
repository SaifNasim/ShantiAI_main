'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Camera,
  CameraOff,
  ShieldAlert,
  Shield,
  Loader2,
  Send,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// COCO-SSD labels considered dangerous in a self-harm context
const DANGEROUS_LABELS = new Set(['knife', 'scissors'])
const ALERT_COOLDOWN_MS = 30_000 // max 1 Telegram alert per 30s

type ModelStatus = 'idle' | 'loading' | 'ready' | 'error'
type CameraStatus = 'off' | 'starting' | 'active' | 'error'

interface DetectionLog {
  id: number
  time: string
  labels: string[]
  dangerous: string[]
  alertSent: boolean
}

export function SafetyMonitorClient() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const modelRef = useRef<import('@tensorflow-models/coco-ssd').ObjectDetection | null>(null)
  const lastAlertRef = useRef<number>(0)
  const frameRef = useRef(0)

  const [modelStatus, setModelStatus] = useState<ModelStatus>('idle')
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('off')
  const [currentLabels, setCurrentLabels] = useState<string[]>([])
  const [currentDangerous, setCurrentDangerous] = useState<string[]>([])
  const [logs, setLogs] = useState<DetectionLog[]>([])
  const [alertCount, setAlertCount] = useState(0)

  const loadModel = useCallback(async () => {
    if (modelRef.current) return
    setModelStatus('loading')
    try {
      await import('@tensorflow/tfjs')
      const cocoSsd = await import('@tensorflow-models/coco-ssd')
      modelRef.current = await cocoSsd.load({ base: 'lite_mobilenet_v2' })
      setModelStatus('ready')
    } catch (err) {
      console.error('Model load error:', err)
      setModelStatus('error')
    }
  }, [])

  const detect = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const model = modelRef.current
    if (!video || !canvas || !model || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect)
      return
    }

    if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth
    if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) { rafRef.current = requestAnimationFrame(detect); return }

    const predictions = await model.detect(video)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const allLabels: string[] = []
    const dangerousFound: string[] = []

    for (const pred of predictions) {
      if (pred.score < 0.45) continue
      const label = pred.class.toLowerCase()
      allLabels.push(label)
      const isDangerous = DANGEROUS_LABELS.has(label)
      if (isDangerous) dangerousFound.push(label)

      const [x, y, w, h] = pred.bbox
      const color = isDangerous ? '#ef4444' : '#22c55e'

      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.strokeRect(x, y, w, h)

      const text = `${pred.class} ${Math.round(pred.score * 100)}%`
      ctx.font = 'bold 14px sans-serif'
      const textW = ctx.measureText(text).width
      ctx.fillStyle = color
      ctx.fillRect(x, y - 24, textW + 10, 22)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(text, x + 5, y - 7)
    }

    setCurrentLabels(allLabels)
    setCurrentDangerous(dangerousFound)

    // Only log and alert when a dangerous object is found (with cooldown)
    if (dangerousFound.length > 0) {
      const now = Date.now()
      if (now - lastAlertRef.current > ALERT_COOLDOWN_MS) {
        lastAlertRef.current = now
        const unique = [...new Set(dangerousFound)]
        const entry: DetectionLog = {
          id: ++frameRef.current,
          time: new Date().toLocaleTimeString(),
          labels: [...new Set(allLabels)],
          dangerous: unique,
          alertSent: true,
        }
        setLogs((prev) => [entry, ...prev].slice(0, 50))
        setAlertCount((c) => c + 1)
        fetch('/api/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ objects: unique }),
        }).catch(() => {})
      }
    } else {
      frameRef.current++
    }

    rafRef.current = requestAnimationFrame(detect)
  }, [])

  const stopCamera = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
    if (videoRef.current) videoRef.current.srcObject = null
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setCameraStatus('off')
    setCurrentLabels([])
    setCurrentDangerous([])
  }, [])

  const startCamera = useCallback(async () => {
    setCameraStatus('starting')
    await loadModel()
    if (!modelRef.current) { setCameraStatus('error'); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraStatus('active')
      rafRef.current = requestAnimationFrame(detect)
    } catch {
      setCameraStatus('error')
    }
  }, [loadModel, detect])

  useEffect(() => () => stopCamera(), [stopCamera])

  const isRunning = cameraStatus === 'active'
  const isStarting = cameraStatus === 'starting' || modelStatus === 'loading'

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            <h1 className="text-2xl font-bold">Safety Check</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Real-time browser-based object detection. Telegram alert fires only when a dangerous object is detected.
          </p>
        </div>
        {alertCount > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1 gap-1">
            <Send className="w-3 h-3" />
            {alertCount} alert{alertCount !== 1 ? 's' : ''} sent
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Camera Feed
              </CardTitle>
              <div className="flex items-center gap-2">
                {modelStatus === 'loading' && (
                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading AI…
                  </span>
                )}
                {isRunning && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-semibold text-red-400">LIVE</span>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video + canvas overlay */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-border/50">
              <video
                ref={videoRef}
                className={cn('w-full h-full object-cover', !isRunning && 'opacity-0')}
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className={cn('absolute inset-0 w-full h-full', !isRunning && 'opacity-0')}
              />

              {!isRunning && !isStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <CameraOff className="w-12 h-12 opacity-30" />
                  <p className="text-sm opacity-60">
                    {cameraStatus === 'error' ? 'Camera permission denied' : 'Camera off'}
                  </p>
                </div>
              )}

              {isStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-white/70">
                    {modelStatus === 'loading' ? 'Loading AI model…' : 'Starting camera…'}
                  </p>
                </div>
              )}

              {/* Red border flash when danger detected */}
              {currentDangerous.length > 0 && (
                <div className="absolute inset-0 pointer-events-none border-4 border-red-500 rounded-xl animate-pulse" />
              )}

              {/* Corner brackets */}
              {isRunning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-green-400/70 rounded-tl" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-green-400/70 rounded-tr" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-green-400/70 rounded-bl" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-green-400/70 rounded-br" />
                </div>
              )}
            </div>

            {/* Live label chips */}
            {isRunning && (
              <div className="min-h-7">
                {currentLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {[...new Set(currentLabels)].map((label) => (
                      <span
                        key={label}
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full border font-medium',
                          DANGEROUS_LABELS.has(label)
                            ? 'bg-red-500/20 border-red-500/50 text-red-300'
                            : 'bg-muted/50 border-border/50 text-muted-foreground',
                        )}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/60">Scanning…</p>
                )}
              </div>
            )}

            {isRunning ? (
              <Button variant="destructive" className="w-full" onClick={stopCamera}>
                <CameraOff className="w-4 h-4 mr-2" />
                Stop Monitoring
              </Button>
            ) : (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={startCamera}
                disabled={isStarting}
              >
                {isStarting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
                )}
                {isStarting ? 'Starting…' : 'Start Monitoring'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Detection Log */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Detection Log
              </CardTitle>
              {logs.length > 0 && (
                <Badge variant="outline" className="text-xs">{logs.length}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                <Shield className="w-10 h-10 opacity-20" />
                <p className="text-sm">No danger detected</p>
                <p className="text-xs opacity-50">Alerts will appear here if a dangerous object is detected</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-95 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border text-sm bg-red-500/10 border-red-500/30"
                  >
                    <div className="shrink-0 mt-0.5">
                      <Send className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-xs text-red-400">
                          🚨 Alert Sent to Telegram
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">{log.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="opacity-60">In frame: </span>
                        {log.labels.join(', ') || '—'}
                      </p>
                      <p className="text-xs text-red-400/80 mt-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {log.dangerous.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
