"use client"

import { cn } from "@/lib/utils"

interface LogoFallbackProps {
  width?: number
  height?: number
  className?: string
}

export function LogoFallback({ width = 120, height = 120, className }: LogoFallbackProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center bg-gradient-to-br from-blue-600 to-green-600 rounded-full text-white font-bold",
        className,
      )}
      style={{ width, height }}
    >
      <div className="text-center">
        <div className="text-lg font-bold">⚽</div>
      </div>
    </div>
  )
}
