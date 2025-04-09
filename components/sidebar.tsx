"use client"

import { AlarmClock, ClockIcon, TimerIcon, ClockIcon as StopwatchIcon } from "lucide-react"

interface SidebarProps {
  mode: string
  setMode: (mode: "timer" | "alarm" | "stopwatch" | "clock") => void
}

export function Sidebar({ mode, setMode }: SidebarProps) {
  return (
    <div className="w-20 bg-gray-900 text-white flex flex-col">
      <button
        className={`flex flex-col items-center justify-center p-4 h-20 ${
          mode === "alarm" ? "bg-gray-800" : ""
        } hover:bg-gray-800 transition-colors`}
        onClick={() => setMode("alarm")}
      >
        <AlarmClock className="h-6 w-6 mb-1" />
        <span className="text-xs">Alarm Clock</span>
      </button>
      <button
        className={`flex flex-col items-center justify-center p-4 h-20 ${
          mode === "timer" ? "bg-gray-800" : ""
        } hover:bg-gray-800 transition-colors`}
        onClick={() => setMode("timer")}
      >
        <TimerIcon className="h-6 w-6 mb-1" />
        <span className="text-xs">Timer</span>
      </button>
      {/* <button
        className={`flex flex-col items-center justify-center p-4 h-20 ${
          mode === "stopwatch" ? "bg-gray-800" : ""
        } hover:bg-gray-800 transition-colors`}
        onClick={() => setMode("stopwatch")}
      >
        <StopwatchIcon className="h-6 w-6 mb-1" />
        <span className="text-xs">Stopwatch</span>
      </button> */}
      <button
        className={`flex flex-col items-center justify-center p-4 h-20 ${
          mode === "clock" ? "bg-gray-800" : ""
        } hover:bg-gray-800 transition-colors`}
        onClick={() => setMode("clock")}
      >
        <ClockIcon className="h-6 w-6 mb-1" />
        <span className="text-xs">Time</span>
      </button>
    </div>
  )
}
