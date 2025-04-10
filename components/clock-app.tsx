"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Timer } from "@/components/timer"
import { Alarm } from "@/components/alarm"
import { Stopwatch } from "@/components/stopwatch"
import { Clock } from "@/components/clock"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useZoom } from "@/hooks/use-zoom"
import { useSettings } from "@/hooks/use-settings"
import Image from "next/image"

import logo from "../public/logo.png"


type ClockMode = "timer" | "alarm" | "stopwatch" | "clock"

export function ClockApp() {
  const [mode, setMode] = useLocalStorage<ClockMode>("vclock-mode", "timer")
  const { zoomLevel, timeDisplaySize, increaseTimeSize, decreaseTimeSize } = useZoom()
  const [isFullScreen, setIsFullScreen] = useState(false)
  const { focusMode } = useSettings()

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullScreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange)
    }
  }, [])

  const toggleFullScreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen()
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err)
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-screen" style={{ fontSize: `${zoomLevel}%` }}>
      <Header
        increaseTimeSize={increaseTimeSize}
        decreaseTimeSize={decreaseTimeSize}
        toggleFullScreen={toggleFullScreen}
        isFullScreen={isFullScreen}
      />
      <div className="flex flex-1 overflow-hidden">
        {!isFullScreen && <Sidebar mode={mode} setMode={setMode} />}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {mode === "timer" && <Timer isFullScreen={isFullScreen} timeDisplaySize={timeDisplaySize} />}
          {mode === "alarm" && <Alarm isFullScreen={isFullScreen} timeDisplaySize={timeDisplaySize} />}
          {mode === "stopwatch" && <Stopwatch isFullScreen={isFullScreen} timeDisplaySize={timeDisplaySize} />}
          {mode === "clock" && <Clock isFullScreen={isFullScreen} timeDisplaySize={timeDisplaySize} />}
        </main>
      </div>
    </div>
  )
}
