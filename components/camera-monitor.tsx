'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, CameraOff, AlertTriangle, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CAPTURE_INTERVAL_MS = 8000 // check every 8 seconds

type MonitorStatus = 'off' | 'starting' | 'active' | 'danger' | 'error'

export function CameraMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [status, setStatus] = useState<MonitorStatus>('off')
  const [dangerLabel, setDangerLabel] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [alertCount, setAlertCount] = useState(0)

  const stopMonitor = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStatus('off')
    setDangerLabel('')
    setIsAnalyzing(false)
  }, [])

  const captureAndAnalyze = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) return

    setIsAnalyzing(true)

    // Capture frame from video
    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Compress to JPEG and convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.7).replace('data:image/jpeg;base64,', '')

    try {
      const res = await fetch('/api/vision-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.dangerDetected && (data.confidence === 'medium' || data.confidence === 'high')) {
          setStatus('danger')
          setAlertCount((c) => c + 1)
          const label = data.dangerousObjects?.length > 0
            ? data.dangerousObjects.join(', ')
            : data.concern || 'Danger detected'
          setDangerLabel(label)
          // Reset to active after 10s
          setTimeout(() => setStatus('active'), 10000)
        }
      }
    } catch (err) {
      console.error('Vision check failed:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const startMonitor = useCallback(async () => {
    setStatus('starting')
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

      setStatus('active')

      // Start periodic analysis
      intervalRef.current = setInterval(captureAndAnalyze, CAPTURE_INTERVAL_MS)
      // Run first check after 2s
      setTimeout(captureAndAnalyze, 2000)
    } catch (err: unknown) {
      console.error('Camera error:', err)
      setStatus('error')
    }
  }, [captureAndAnalyze])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopMonitor()
  }, [stopMonitor])

  const statusConfig = {
    off: {
      dot: 'bg-muted-foreground',
      label: 'Camera Off',
      icon: CameraOff,
      iconColor: 'text-muted-foreground',
    },
    starting: {
      dot: 'bg-yellow-400 animate-pulse',
      label: 'Starting…',
      icon: Loader2,
      iconColor: 'text-yellow-400',
    },
    active: {
      dot: 'bg-green-400 animate-pulse',
      label: 'Monitoring',
      icon: Shield,
      iconColor: 'text-green-400',
    },
    danger: {
      dot: 'bg-red-500 animate-pulse',
      label: 'ALERT SENT',
      icon: AlertTriangle,
      iconColor: 'text-red-500',
    },
    error: {
      dot: 'bg-orange-400',
      label: 'Camera Error',
      icon: CameraOff,
      iconColor: 'text-orange-400',
    },
  }

  const cfg = statusConfig[status]

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2',
    )}>
      {/* Alert banner */}
      {status === 'danger' && dangerLabel && (
        <div className="bg-red-500/90 text-white text-xs px-3 py-2 rounded-lg max-w-55 text-right shadow-lg animate-in slide-in-from-right-2">
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          <span className="font-semibold">Danger detected:</span>
          <br />
          {dangerLabel}
          <br />
          <span className="opacity-80">Telegram alert sent.</span>
        </div>
      )}

      {/* Monitor pill */}
      <div className={cn(
        'flex items-center gap-2 rounded-full px-3 py-2 shadow-lg backdrop-blur-sm border transition-all',
        status === 'off' || status === 'error'
          ? 'bg-card/80 border-border/50'
          : status === 'danger'
            ? 'bg-red-500/20 border-red-500/50'
            : 'bg-card/80 border-green-500/30',
      )}>
        {/* Status dot */}
        <span className={cn('w-2 h-2 rounded-full shrink-0', cfg.dot)} />

        {/* Icon */}
        {status === 'starting' ? (
          <Loader2 className={cn('w-4 h-4 animate-spin', cfg.iconColor)} />
        ) : (
          <cfg.icon className={cn('w-4 h-4', cfg.iconColor)} />
        )}

        {/* Label */}
        <span className={cn('text-xs font-medium', cfg.iconColor)}>
          {cfg.label}
        </span>

        {alertCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {alertCount}
          </span>
        )}

        {isAnalyzing && (
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        )}

        {/* Toggle button */}
        {status === 'off' || status === 'error' ? (
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[10px] ml-1"
            onClick={startMonitor}
          >
            <Camera className="w-3 h-3 mr-1" />
            Enable
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[10px] ml-1 text-muted-foreground hover:text-foreground"
            onClick={stopMonitor}
          >
            Stop
          </Button>
        )}
      </div>

      {/* Hidden video + canvas for capture */}
      <video ref={videoRef} className="hidden" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
