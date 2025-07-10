"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, type User } from "@/lib/auth"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }

        setUser(currentUser)

        // Redirigir según el rol
        if (currentUser.role === "admin") {
          router.push("/admin")
        } else if (currentUser.role === "student") {
          router.push("/student")
        } else if (currentUser.role === "coach") {
          router.push("/coach")
        }
      } catch (error) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return null
}
