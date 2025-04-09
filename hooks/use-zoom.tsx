"use client"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function useZoom() {
  const [timeDisplaySize, setTimeDisplaySize] = useLocalStorage("vclock-time-display-size", 100)
  const [zoomLevel, setZoomLevel] = useLocalStorage("vclock-zoom-level", 100)

  const increaseZoom = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200))
  }

  const decreaseZoom = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50))
  }

  const increaseTimeSize = () => {
    setTimeDisplaySize((prev) => Math.min(prev + 10, 200))
  }

  const decreaseTimeSize = () => {
    setTimeDisplaySize((prev) => Math.max(prev - 10, 50))
  }

  return {
    zoomLevel,
    increaseZoom,
    decreaseZoom,
    timeDisplaySize,
    increaseTimeSize,
    decreaseTimeSize,
  }
}
