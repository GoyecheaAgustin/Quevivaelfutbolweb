"use client"

import Image from "next/image"
import { useState } from "react"
import { LogoFallback } from "./logo-fallback"

interface LogoProps {
  className?: string
  priority?: boolean
}

export function Logo({ className = "h-12 w-auto", priority = false }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return <LogoFallback className={className} />
  }

  return (
    <div className="relative">
      <Image
        src="/images/logo-oficial.png"
        alt="Escuela de Fútbol"
        width={200}
        height={80}
        className={`${className} object-contain transition-all duration-300 hover:scale-105`}
        priority={priority}
        onError={() => setImageError(true)}
      />
    </div>
  )
}

export function LogoLogin({ className = "h-16 w-auto", priority = false }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return <LogoFallback className={className} />
  }

  return (
    <div className="relative animate-pulse">
      <Image
        src="/images/logo-oficial.png"
        alt="Escuela de Fútbol"
        width={250}
        height={100}
        className={`${className} object-contain transition-all duration-500 hover:scale-110 drop-shadow-lg`}
        priority={priority}
        onError={() => setImageError(true)}
      />
    </div>
  )
}

export function LogoRegister({ className = "h-20 w-auto", priority = false }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return <LogoFallback className={className} />
  }

  return (
    <div className="relative">
      <Image
        src="/images/logo-oficial.png"
        alt="Escuela de Fútbol"
        width={300}
        height={120}
        className={`${className} object-contain transition-all duration-700 hover:scale-105 filter drop-shadow-2xl animate-fade-in`}
        priority={priority}
        onError={() => setImageError(true)}
      />
    </div>
  )
}
