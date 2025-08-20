"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

export default function DashboardRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    async function redirectUser() {
      try {
        const user = await getCurrentUser()
        if (user) {
          if (user.profile_completed === false && user.role === "student") {
            router.push("/completar-perfil")
          } else if (user.role === "admin") {
            router.push("/admin")
          } else if (user.role === "coach") {
            router.push("/coach")
          } else if (user.role === "student") {
            router.push("/student")
          } else {
            // Fallback para roles desconocidos o no manejados
            router.push("/login")
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error al obtener el usuario o redirigir:", error)
        router.push("/login") // Redirigir al login en caso de error
      }
    }

    redirectUser()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
      <p className="ml-4 text-lg text-gray-700">Cargando dashboard...</p>
    </div>
  )
}
