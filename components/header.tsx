"use client"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Settings } from "@/components/settings"
import { Maximize, Minimize, Plus, Minus } from "lucide-react"
import Image from "next/image"

// logo
import logo from "../public/logo.png"

interface HeaderProps {
  increaseTimeSize: () => void
  decreaseTimeSize: () => void
  toggleFullScreen: () => void
  isFullScreen: boolean
}

export function Header({ increaseTimeSize, decreaseTimeSize, toggleFullScreen, isFullScreen }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white dark:bg-gray-900 header">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold"></h1>
        <Image className="w-[50px]" src={logo} alt="logo"/>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={decreaseTimeSize}
            className="text-white hover:bg-gray-700 dark:hover:bg-gray-800 h-8 w-8"
            aria-label="Decrease time size"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={increaseTimeSize}
            className="text-white hover:bg-gray-700 dark:hover:bg-gray-800 h-8 w-8"
            aria-label="Increase time size"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ModeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullScreen}
          className="text-white hover:bg-gray-700 dark:hover:bg-gray-800 h-8 w-8"
          aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
        <Settings />
      </div>
    </header>
  )
}
