"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Flag } from "lucide-react"
import { formatTimeWithMs } from "@/lib/utils"
import { useSettings } from "@/hooks/use-settings"

interface Lap {
  id: number
  time: number
  total: number
}

interface StopwatchProps {
  isFullScreen: boolean
  timeDisplaySize: number
}

export function Stopwatch({ isFullScreen, timeDisplaySize }: StopwatchProps) {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const pausedAtRef = useRef<number>(0)
  const { timeColor } = useSettings()

  // Load saved state
  useEffect(() => {
    const savedState = localStorage.getItem("vclock-stopwatch-state")
    if (savedState) {
      try {
        const { time, isRunning, startTime, pausedAt, laps } = JSON.parse(savedState)

        if (isRunning) {
          const elapsed = Math.floor(Date.now() - startTime)
          setTime(elapsed)
          startTimeRef.current = Date.now() - elapsed
          setIsRunning(true)
          startStopwatch(elapsed)
        } else {
          setTime(time)
          pausedAtRef.current = pausedAt
        }

        setLaps(laps || [])
      } catch (error) {
        console.error("Error parsing stopwatch state:", error)
      }
    }
  }, [])

  // Save state
  useEffect(() => {
    localStorage.setItem(
      "vclock-stopwatch-state",
      JSON.stringify({
        time,
        isRunning,
        startTime: startTimeRef.current,
        pausedAt: pausedAtRef.current,
        laps,
      }),
    )
  }, [time, isRunning, laps])

  const startStopwatch = (initialTime = time) => {
    if (!isRunning) {
      clearInterval(intervalRef.current as NodeJS.Timeout)

      startTimeRef.current = Date.now() - initialTime
      setIsRunning(true)

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - (startTimeRef.current || 0)
        setTime(elapsed)
      }, 10)
    }
  }

  const pauseStopwatch = () => {
    pausedAtRef.current = time
    setIsRunning(false)
    clearInterval(intervalRef.current as NodeJS.Timeout)
  }

  const resetStopwatch = () => {
    setIsRunning(false)
    clearInterval(intervalRef.current as NodeJS.Timeout)
    setTime(0)
    setLaps([])
    startTimeRef.current = null
    pausedAtRef.current = 0
  }

  const addLap = () => {
    if (isRunning) {
      const lastLapTime = laps.length > 0 ? laps[0].total : 0
      const lapTime = time - lastLapTime

      setLaps([
        {
          id: Date.now(),
          time: lapTime,
          total: time,
        },
        ...laps,
      ])
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div
          className={`digital-clock tracking-wider time-display time-display-${timeColor} tabular-nums time-container`}
          style={{
            fontSize: `${timeDisplaySize * 0.08}rem`,
            width: `${timeDisplaySize * 0.08 * 8}rem`, // Fixed width based on the largest possible time format
            textAlign: "center",
          }}
        >
          {formatTimeWithMs(time)}
        </div>

        <div className={`flex space-x-4 mt-8 ${isFullScreen ? "mt-12" : ""}`}>
          {isRunning ? (
            <Button onClick={pauseStopwatch} className="bg-red-500 hover:bg-red-600 text-white px-8">
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button onClick={() => startStopwatch()} className="bg-green-500 hover:bg-green-600 text-white px-8">
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          )}

          {isRunning ? (
            <Button onClick={addLap} variant="outline">
              <Flag className="mr-2 h-4 w-4" />
              Lap
            </Button>
          ) : (
            time > 0 && (
              <Button onClick={resetStopwatch} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )
          )}
        </div>
      </div>

      {!isFullScreen && laps.length > 0 && (
        <div className="p-4 bg-white dark:bg-gray-800 max-h-[40vh] overflow-auto">
          <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Laps</h3>
          <div className="space-y-2">
            {laps.map((lap, index) => (
              <div key={lap.id} className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 mr-2">Lap {laps.length - index}</span>
                  <span className={`digital-clock time-display time-display-${timeColor}`}>
                    {formatTimeWithMs(lap.time)}
                  </span>
                </div>
                <div className="text-gray-500 dark:text-gray-400 digital-clock">{formatTimeWithMs(lap.total)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
