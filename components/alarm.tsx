"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useSettings } from "@/hooks/use-settings"
import { AlarmClock, Bell, Plus, Trash2 } from "lucide-react"

interface Alarm {
  id: string
  time: string
  enabled: boolean
  days: {
    mon: boolean
    tue: boolean
    wed: boolean
    thu: boolean
    fri: boolean
    sat: boolean
    sun: boolean
  }
  label: string
}

interface AlarmProps {
  isFullScreen: boolean
  timeDisplaySize: number
}

export function Alarm({ isFullScreen, timeDisplaySize }: AlarmProps) {
  const [alarms, setAlarms] = useLocalStorage<Alarm[]>("vclock-alarms", [])
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [ampm, setAmpm] = useState("")
  const { soundEnabled, notificationsEnabled, timeColor, hourFormat } = useSettings()
  const alarmSound = useRef<HTMLAudioElement | null>(null)
  const [activeAlarm, setActiveAlarm] = useState<string | null>(null)

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()

      if (hourFormat === "12h") {
        const hours = (now.getHours() % 12 || 12).toString().padStart(2, "0")
        const minutes = now.getMinutes().toString().padStart(2, "0")
        setCurrentTime(`${hours}:${minutes}`)
        setAmpm(now.getHours() >= 12 ? "PM" : "AM")
      } else {
        const hours = now.getHours().toString().padStart(2, "0")
        const minutes = now.getMinutes().toString().padStart(2, "0")
        setCurrentTime(`${hours}:${minutes}`)
        setAmpm("")
      }

      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      setCurrentDate(`${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [hourFormat])

  // Check for alarms
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.

      const dayMap: Record<number, keyof Alarm["days"]> = {
        1: "mon",
        2: "tue",
        3: "wed",
        4: "thu",
        5: "fri",
        6: "sat",
        0: "sun",
      }

      const currentDayKey = dayMap[currentDay]

      alarms.forEach((alarm) => {
        if (alarm.enabled && alarm.days[currentDayKey]) {
          const [alarmHour, alarmMinute] = alarm.time.split(":").map(Number)

          if (alarmHour === currentHour && alarmMinute === currentMinute && activeAlarm !== alarm.id) {
            triggerAlarm(alarm)
          }
        }
      })
    }

    const interval = setInterval(checkAlarms, 1000)
    return () => clearInterval(interval)
  }, [alarms, activeAlarm, soundEnabled, notificationsEnabled])

  const triggerAlarm = (alarm: Alarm) => {
    setActiveAlarm(alarm.id)

    if (soundEnabled) {
      if (!alarmSound.current) {
        alarmSound.current = new Audio("/alarm.mp3")
        alarmSound.current.loop = true
      }
      alarmSound.current.play().catch((e) => console.error("Error playing sound:", e))
    }

    if (notificationsEnabled) {
      if (Notification.permission === "granted") {
        new Notification("Alarm", {
          body: alarm.label || "Your alarm is ringing!",
          icon: "/favicon.ico",
        })
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission()
      }
    }

    // Auto-stop after 1 minute
    setTimeout(() => {
      stopAlarm()
    }, 60000)
  }

  const stopAlarm = () => {
    setActiveAlarm(null)
    if (alarmSound.current) {
      alarmSound.current.pause()
      alarmSound.current.currentTime = 0
    }
  }

  const addAlarm = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")

    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: `${hours}:${minutes}`,
      enabled: true,
      days: {
        mon: true,
        tue: true,
        wed: true,
        thu: true,
        fri: true,
        sat: true,
        sun: true,
      },
      label: "Alarm",
    }

    setAlarms([...alarms, newAlarm])
  }

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map((alarm) => (alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm)))
  }

  const updateAlarm = (id: string, updates: Partial<Alarm>) => {
    setAlarms(alarms.map((alarm) => (alarm.id === id ? { ...alarm, ...updates } : alarm)))
  }

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter((alarm) => alarm.id !== id))
  }

  const toggleDay = (id: string, day: keyof Alarm["days"]) => {
    setAlarms(
      alarms.map((alarm) => (alarm.id === id ? { ...alarm, days: { ...alarm.days, [day]: !alarm.days[day] } } : alarm)),
    )
  }

  return (
    <div className="flex flex-col h-full">
      {activeAlarm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full text-center">
            <AlarmClock className="h-16 w-16 mx-auto mb-4 text-red-500 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">{alarms.find((a) => a.id === activeAlarm)?.label || "Alarm"}</h2>
            <p className={`text-4xl digital-clock mb-6 time-display time-display-${timeColor}`}>{currentTime}</p>
            <Button onClick={stopAlarm} className="w-full bg-red-500 hover:bg-red-600 text-white" size="lg">
              Stop Alarm
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative time-container">
          <div
            className={`digital-clock tracking-wider mb-2 time-display time-display-${timeColor} tabular-nums`}
            style={{ fontSize: `${timeDisplaySize * 0.08}rem` }}
          >
            {currentTime}
          </div>
          {ampm && (
            <div className="absolute top-0 right-0 transform translate-x-full -translate-y-1/4 text-2xl text-gray-500 dark:text-gray-400">
              {ampm}
            </div>
          )}
        </div>
        <div className="text-gray-500 dark:text-gray-400">{currentDate}</div>
      </div>

      {!isFullScreen && (
        <div className="p-4 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Alarms</h2>
            <Button onClick={addAlarm} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Alarm
            </Button>
          </div>

          <div className="space-y-4">
            {alarms.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No alarms set</p>
                <Button onClick={addAlarm} variant="link" className="mt-2">
                  Add your first alarm
                </Button>
              </div>
            ) : (
              alarms.map((alarm) => (
                <div key={alarm.id} className="border rounded-lg p-4 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Input
                        type="time"
                        value={alarm.time}
                        onChange={(e) => updateAlarm(alarm.id, { time: e.target.value })}
                        className="border-none p-0 text-xl digital-clock"
                      />
                    </div>
                    <Switch checked={alarm.enabled} onCheckedChange={() => toggleAlarm(alarm.id)} />
                  </div>

                  <div className="flex gap-1 mb-2">
                    {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(alarm.id, day as keyof Alarm["days"])}
                        className={`w-7 h-7 rounded-full text-xs ${
                          alarm.days[day as keyof Alarm["days"]]
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {day.charAt(0).toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <Input
                      value={alarm.label}
                      onChange={(e) => updateAlarm(alarm.id, { label: e.target.value })}
                      placeholder="Alarm label"
                      className="border-none p-0 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlarm(alarm.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
