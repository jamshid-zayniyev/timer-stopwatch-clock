"use client"

import { useLocalStorage } from "@/hooks/use-local-storage"

export function useSettings() {
  const [soundEnabled, setSoundEnabled] = useLocalStorage("vclock-sound-enabled", true)
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage("vclock-notifications-enabled", true)
  const [hourFormat, setHourFormat] = useLocalStorage<"12h" | "24h">("vclock-hour-format", "24h")
  const [timeColor, setTimeColor] = useLocalStorage<string>("vclock-time-color", "yellow")
  const [focusMode, setFocusMode] = useLocalStorage<boolean>("vclock-focus-mode", false)

  return {
    soundEnabled,
    setSoundEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    hourFormat,
    setHourFormat,
    timeColor,
    setTimeColor,
    focusMode,
    setFocusMode,
  }
}
