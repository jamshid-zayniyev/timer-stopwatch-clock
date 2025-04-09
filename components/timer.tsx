"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Pause, Play, RotateCcw } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useSettings } from "@/hooks/use-settings"
import { formatTime } from "@/lib/utils"

interface TimerPreset {
  label: string
  seconds: number
}

interface TimerProps {
  isFullScreen: boolean
  timeDisplaySize: number
}

export function Timer({ isFullScreen, timeDisplaySize }: TimerProps) {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [recentlyUsed, setRecentlyUsed] = useLocalStorage<number[]>("vclock-recently-used", [])
  const { soundEnabled, notificationsEnabled, timeColor } = useSettings()
  const alarmSound = useRef<HTMLAudioElement | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [showCustomTimerModal, setShowCustomTimerModal] = useState(false)
  const [customHours, setCustomHours] = useState(0)
  const [customMinutes, setCustomMinutes] = useState(0)
  const [customSeconds, setCustomSeconds] = useState(0)

  // Timer state persistence
  useEffect(() => {
    const savedTimer = localStorage.getItem("vclock-timer-state")
    if (savedTimer) {
      try {
        const { time, isRunning, startTime, pausedAt } = JSON.parse(savedTimer)

        if (isRunning) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          const remainingTime = Math.max(0, time - elapsed)
          setTime(remainingTime)
          setIsRunning(remainingTime > 0)
          setIsFinished(remainingTime === 0)
        } else {
          setTime(time)
          setIsRunning(false)
        }
      } catch (error) {
        console.error("Error parsing timer state:", error)
      }
    }
  }, []) // Empty dependency array to run only once on mount

  // Save timer state
  useEffect(() => {
    const timerState = {
      time,
      isRunning,
      startTime: isRunning ? Date.now() - (time > 0 ? time : 0) * 1000 : null,
      pausedAt: !isRunning ? Date.now() : null,
    }

    localStorage.setItem("vclock-timer-state", JSON.stringify(timerState))
  }, [time, isRunning]) // Only depend on time and isRunning

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval as NodeJS.Timeout)
            setIsRunning(false)
            setIsFinished(true)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (time === 0 && isRunning) {
      setIsRunning(false)
      setIsFinished(true)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, time])

  // Handle timer completion
  useEffect(() => {
    if (isFinished) {
      setShowAlert(true)

      if (soundEnabled) {
        if (!alarmSound.current) {
          alarmSound.current = new Audio("/alarm.mp3")
          alarmSound.current.loop = true
        }
        alarmSound.current.play().catch((e) => console.error("Error playing sound:", e))
      }

      if (notificationsEnabled) {
        if (Notification.permission === "granted") {
          new Notification("Timer Finished", {
            body: "Your timer has completed!",
            icon: "/favicon.ico",
          })
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission()
        }
      }
    } else {
      if (alarmSound.current) {
        alarmSound.current.pause()
        alarmSound.current.currentTime = 0
      }
    }

    return () => {
      if (alarmSound.current) {
        alarmSound.current.pause()
        alarmSound.current.currentTime = 0
      }
    }
  }, [isFinished, soundEnabled, notificationsEnabled])

  const startTimer = () => {
    if (time > 0) {
      setIsRunning(true)
      setIsFinished(false)
      setShowAlert(false)

      // Add to recently used if not already there
      if (!recentlyUsed.includes(time)) {
        setRecentlyUsed((prev) => {
          const updated = [time, ...prev].slice(0, 5)
          return updated
        })
      }
    }
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsFinished(false)
    setShowAlert(false)
    setTime(0)
    if (alarmSound.current) {
      alarmSound.current.pause()
      alarmSound.current.currentTime = 0
    }
  }

  const setTimerPreset = (seconds: number) => {
    resetTimer()
    setTime(seconds)
  }

  const dismissAlert = () => {
    setShowAlert(false)
    if (alarmSound.current) {
      alarmSound.current.pause()
      alarmSound.current.currentTime = 0
    }
    setIsFinished(false)
  }

  const minutePresets: TimerPreset[] = [
    { label: "1 Minute Timer", seconds: 60 },
    { label: "3 Minute Timer", seconds: 180 },
    { label: "5 Minute Timer", seconds: 300 },
    { label: "10 Minute Timer", seconds: 600 },
    { label: "15 Minute Timer", seconds: 900 },
    { label: "20 Minute Timer", seconds: 1200 },
    { label: "30 Minute Timer", seconds: 1800 },
  ]

  const secondPresets: TimerPreset[] = [
    { label: "10 Second Timer", seconds: 10 },
    { label: "20 Second Timer", seconds: 20 },
    { label: "30 Second Timer", seconds: 30 },
    { label: "45 Second Timer", seconds: 45 },
    { label: "60 Second Timer", seconds: 60 },
    { label: "90 Second Timer", seconds: 90 },
    { label: "1 Hour Timer", seconds: 3600 },
  ]

  const applyCustomTimer = () => {
    const totalSeconds = customHours * 3600 + customMinutes * 60 + customSeconds
    if (totalSeconds > 0) {
      setTime(totalSeconds)
      setShowCustomTimerModal(false)
      setCustomHours(0)
      setCustomMinutes(0)
      setCustomSeconds(0)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 z-50 alert-slide-down flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold mr-2">⏰</span>
            <span>Timer Complete!</span>
          </div>
          <Button variant="ghost" className="text-white hover:bg-red-600" onClick={dismissAlert}>
            Dismiss
          </Button>
        </div>
      )}
      {showCustomTimerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Set Custom Timer</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={customHours}
                  onChange={(e) => setCustomHours(Math.max(0, Number.parseInt(e.target.value) || 0))}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(0, Number.parseInt(e.target.value) || 0))}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(Math.max(0, Number.parseInt(e.target.value) || 0))}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCustomTimerModal(false)}>
                Cancel
              </Button>
              <Button onClick={applyCustomTimer} className="bg-green-500 hover:bg-green-600 text-white">
                Set Timer
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col items-center justify-center p-4 relative ${isFullScreen ? "pb-16" : ""}`}>
        <div
          className={`digital-clock tracking-wider time-display time-display-${timeColor} tabular-nums time-container`}
          style={{ fontSize: `${timeDisplaySize * 0.08}rem` }}
        >
          {formatTime(time)}
        </div>

        <div className={`mt-8 ${isFullScreen ? "mt-12" : ""}`}>
          {isRunning ? (
            <Button onClick={pauseTimer} className="bg-red-500 hover:bg-red-600 text-white px-8">
              <Pause className="mr-2 h-4 w-4" />
              Pause Timer
            </Button>
          ) : time > 0 ? (
            <Button onClick={startTimer} className="bg-green-500 hover:bg-green-600 text-white px-8">
              <Play className="mr-2 h-4 w-4" />
              Start Timer
            </Button>
          ) : (
            <Button
              onClick={() => setShowCustomTimerModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-8"
            >
              <Play className="mr-2 h-4 w-4" />
              Set Timer
            </Button>
          )}

          {(isRunning || time > 0) && (
            <Button onClick={resetTimer} variant="outline" className="ml-2">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {!isFullScreen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800">
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Set the timer for the specified time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-2">
                {minutePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setTimerPreset(preset.seconds)}
                    className={`block w-full text-left text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm time-display time-display-${timeColor}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {secondPresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setTimerPreset(preset.seconds)}
                    className={`block w-full text-left text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm time-display time-display-${timeColor}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex justify-between">
              Recently used
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">⟳</button>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {recentlyUsed.map((seconds, index) => (
                <div key={index} className="flex justify-between">
                  <button
                    onClick={() => setTimerPreset(seconds)}
                    className={`text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm time-display time-display-${timeColor}`}
                  >
                    {Math.floor(seconds / 60) === 1
                      ? "1 minute"
                      : seconds < 60
                        ? `${seconds} seconds`
                        : `${Math.floor(seconds / 60)} minutes`}
                  </button>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{formatTime(seconds)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
