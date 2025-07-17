"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

// Componente de fallback
function LogoFallback({ width = 120, height = 120, className }: LogoProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center bg-gradient-to-br from-blue-600 to-green-600 rounded-full text-white font-bold shadow-lg",
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

export function Logo({ width = 120, height = 120, className, priority = false }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return <LogoFallback width={width} height={height} className={className} />
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <Image
        src="/images/logo-oficial.png"
        alt="Que Viva El Fútbol - Profe Beto"
        width={width}
        height={height}
        className="object-contain drop-shadow-lg"
        priority={priority}
        onError={() => setImageError(true)}
      />
    </div>
  )
}

export function LogoHero({ width = 220, height = 220, className, priority = false }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return <LogoFallback width={width} height={height} className={cn("animate-float", className)} />
  }

  return (
    <div className={cn("relative inline-block logo-container", className)}>
      <div className="relative animate-float">
        <Image
          src="/images/logo-oficial.png"
          alt="Que Viva El Fútbol - Profe Beto"
          width={width}
          height={height}
          className="object-contain"
          priority={priority}
          onError={() => setImageError(true)}
        />
      </div>
    </div>
  )
}

export function LogoCompact({ width = 50, height = 50, className, priority = false }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return <LogoFallback width={width} height={height} className={className} />
  }

  return (
    <div className={cn("relative inline-block logo-dashboard", className)}>
      <Image
        src="/images/logo-oficial.png"
        alt="Que Viva El Fútbol - Profe Beto"
        width={width}
        height={height}
        className="object-contain"
        priority={priority}
        onError={() => setImageError(true)}
      />
    </div>
  )
}

export function LogoRegister({ width = 140, height = 140, className, priority = false }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return <LogoFallback width={width} height={height} className={cn("animate-pulse-slow", className)} />
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <Image
        src="/images/logo-oficial.png"
        alt="Que Viva El Fútbol - Profe Beto"
        width={width}
        height={height}
        className="object-contain animate-pulse-slow"
        priority={priority}
        onError={() => setImageError(true)}
      />
    </div>
  )
}

export function LogoFooter({ width = 80, height = 80, className, priority = false }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return (
      <LogoFallback
        width={width}
        height={height}
        className={cn("opacity-90 hover:opacity-100 transition-opacity", className)}
      />
    )
  }

  return (
    <div className={cn("relative inline-block opacity-90 hover:opacity-100 transition-opacity", className)}>
      <Image
        src="/images/logo-oficial.png"
        alt="Que Viva El Fútbol - Profe Beto"
        width={width}
        height={height}
        className="object-contain"
        priority={priority}
        onError={() => setImageError(true)}
      />
    </div>
  )
}
