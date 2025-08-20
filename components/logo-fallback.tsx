"use client"

interface LogoFallbackProps {
  className?: string
}

export function LogoFallback({ className = "h-12 w-auto" }: LogoFallbackProps) {
  return (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-r from-purple-600 to-green-600 rounded-lg p-2`}
    >
      <div className="text-white font-bold text-lg">⚽ Escuela de Fútbol</div>
    </div>
  )
}
