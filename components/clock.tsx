"use client"

import { useState, useEffect } from "react"
import { useSettings } from "@/hooks/use-settings"

interface ClockProps {
  isFullScreen: boolean
  timeDisplaySize: number
}

export function Clock({ isFullScreen, timeDisplaySize }: ClockProps) {
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")
  const [seconds, setSeconds] = useState(0)
  const [ampm, setAmpm] = useState("")
  const { hourFormat, timeColor } = useSettings()

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()

      // Format time based on hour format setting
      if (hourFormat === "12h") {
        const hours = (now.getHours() % 12 || 12).toString().padStart(2, "0")
        const minutes = now.getMinutes().toString().padStart(2, "0")
        setTime(`${hours}:${minutes}`)
        setAmpm(now.getHours() >= 12 ? "PM" : "AM")
      } else {
        const hours = now.getHours().toString().padStart(2, "0")
        const minutes = now.getMinutes().toString().padStart(2, "0")
        setTime(`${hours}:${minutes}`)
        setAmpm("")
      }

      // Format date
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
      setDate(now.toLocaleDateString(undefined, options))

      // Update seconds for animation
      setSeconds(now.getSeconds())
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)

    return () => clearInterval(interval)
  }, [hourFormat])

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative time-container">
        <div
          className={`digital-clock tracking-wider mb-4 time-display time-display-${timeColor} tabular-nums`}
          style={{ fontSize: `${timeDisplaySize * 0.08}rem` }}
        >
          {time}
        </div>
        {ampm && (
          <div className="absolute top-0 right-0 transform translate-x-full -translate-y-1/4 text-2xl text-gray-500 dark:text-gray-400">
            {ampm}
          </div>
        )}

        {!isFullScreen && (
          <>
            {/* Analog clock */}
            <div className="w-64 h-64 rounded-full border-4 border-gray-300 dark:border-gray-700 relative mx-auto mb-8">
              {/* Clock face */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-4 bg-gray-800 dark:bg-gray-200"
                  style={{
                    height: i % 3 === 0 ? "16px" : "8px",
                    width: i % 3 === 0 ? "4px" : "2px",
                    left: "50%",
                    top: "0",
                    transform: `translateX(-50%) rotate(${i * 30}deg)`,
                    transformOrigin: "bottom center",
                    bottom: "0",
                  }}
                />
              ))}

              {/* Hour hand */}
              <div
                className="absolute w-1.5 h-16 bg-gray-800 dark:bg-gray-200 rounded-full left-1/2 bottom-1/2"
                style={{
                  transformOrigin: "bottom center",
                  transform: `translateX(-50%) rotate(${(new Date().getHours() % 12) * 30 + new Date().getMinutes() * 0.5}deg)`,
                }}
              />

              {/* Minute hand */}
              <div
                className="absolute w-1 h-24 bg-gray-600 dark:bg-gray-400 rounded-full left-1/2 bottom-1/2"
                style={{
                  transformOrigin: "bottom center",
                  transform: `translateX(-50%) rotate(${new Date().getMinutes() * 6}deg)`,
                }}
              />

              {/* Second hand */}
              <div
                className="absolute w-0.5 h-28 rounded-full left-1/2 bottom-1/2"
                style={{
                  backgroundColor: `hsl(var(--time-color))`,
                  transformOrigin: "bottom center",
                  transform: `translateX(-50%) rotate(${seconds * 6}deg)`,
                  transition: "transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
                }}
              />

              {/* Center dot */}
              <div
                className="absolute w-3 h-3 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{ backgroundColor: `hsl(var(--time-color))` }}
              />
            </div>

            <div className="text-xl text-center text-gray-600 dark:text-gray-400">{date}</div>
          </>
        )}
      </div>
    </div>
  )
}
