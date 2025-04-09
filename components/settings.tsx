"use client"

import { useState, useEffect } from "react"
import { SettingsIcon, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useSettings } from "@/hooks/use-settings"

export function Settings() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const {
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
  } = useSettings()
  const [autoStartEnabled, setAutoStartEnabled] = useState(false)

  // Apply time color immediately to document
  useEffect(() => {
    const root = document.documentElement

    // Remove all color classes first
    root.classList.remove(
      "time-display-blue",
      "time-display-green",
      "time-display-red",
      "time-display-purple",
      "time-display-orange",
      "time-display-yellow",
    )

    // Add the selected color class
    root.classList.add(`time-display-${timeColor}`)

    // Update CSS variable directly for immediate effect
    root.style.setProperty("--time-color", getColorValue(timeColor))
  }, [timeColor])

  // Apply focus mode class to body
  useEffect(() => {
    if (focusMode) {
      document.body.classList.add("focus-mode-active")
    } else {
      document.body.classList.remove("focus-mode-active")
    }
  }, [focusMode])

  const handleHourFormatChange = (format: string) => {
    setHourFormat(format as "12h" | "24h")
  }

  const handleTimeColorChange = (color: string) => {
    setTimeColor(color)
  }

  const toggleFocusMode = () => {
    setFocusMode(!focusMode)
  }

  const getColorValue = (color: string): string => {
    switch (color) {
      case "blue":
        return "210 100% 50%"
      case "green":
        return "142 71% 45%"
      case "red":
        return "0 91% 71%"
      case "purple":
        return "262 83% 58%"
      case "orange":
        return "27 96% 61%"
      case "yellow":
        return "48 100% 50%"
      default:
        return "210 100% 50%"
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 dark:hover:bg-gray-800 h-8 w-8">
            <SettingsIcon className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Customize your Clock experience</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="hour-format">Hour Format</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={hourFormat === "12h" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleHourFormatChange("12h")}
                  >
                    12h
                  </Button>
                  <Button
                    variant={hourFormat === "24h" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleHourFormatChange("24h")}
                  >
                    24h
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-start">Auto Start Timer</Label>
                <Switch id="auto-start" checked={autoStartEnabled} onCheckedChange={setAutoStartEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="focus-mode">Focus Mode</Label>
                <Switch id="focus-mode" checked={focusMode} onCheckedChange={setFocusMode} />
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Focus mode dims everything except the time display, helping you concentrate on the time.
              </div>
            </TabsContent>
            <TabsContent value="appearance" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => document.documentElement.classList.remove("dark")}>
                    Light
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => document.documentElement.classList.add("dark")}>
                    Dark
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Time Display Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`bg-blue-500 hover:bg-blue-600 ${timeColor === "blue" ? "ring-2 ring-offset-2" : ""}`}
                    onClick={() => handleTimeColorChange("blue")}
                  >
                    <span className="sr-only">Blue</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`bg-green-500 hover:bg-green-600 ${timeColor === "green" ? "ring-2 ring-offset-2" : ""}`}
                    onClick={() => handleTimeColorChange("green")}
                  >
                    <span className="sr-only">Green</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`bg-red-500 hover:bg-red-600 ${timeColor === "red" ? "ring-2 ring-offset-2" : ""}`}
                    onClick={() => handleTimeColorChange("red")}
                  >
                    <span className="sr-only">Red</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`bg-purple-500 hover:bg-purple-600 ${
                      timeColor === "purple" ? "ring-2 ring-offset-2" : ""
                    }`}
                    onClick={() => handleTimeColorChange("purple")}
                  >
                    <span className="sr-only">Purple</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`bg-orange-500 hover:bg-orange-600 ${
                      timeColor === "orange" ? "ring-2 ring-offset-2" : ""
                    }`}
                    onClick={() => handleTimeColorChange("orange")}
                  >
                    <span className="sr-only">Orange</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`bg-yellow-500 hover:bg-yellow-600 ${
                      timeColor === "yellow" ? "ring-2 ring-offset-2" : ""
                    }`}
                    onClick={() => handleTimeColorChange("yellow")}
                  >
                    <span className="sr-only">Yellow</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound">Sound</Label>
                <Switch id="sound" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Browser Notifications</Label>
                <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {focusMode && (
        <Button
          variant="outline"
          size="icon"
          className="focus-mode-toggle"
          onClick={toggleFocusMode}
          title="Exit Focus Mode"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
    </>
  )
}
