"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "@/lib/auth"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { DbConnectionStatus } from "@/components/db-connection-status"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn(email, password)
      console.log("🎯 Resultado de signIn:", result)

      if (result.requiresProfile) {
        console.log("➡️ Redirigiendo a completar-perfil")
        router.push("/completar-perfil")
      } else {
        console.log("➡️ Redirigiendo a dashboard")
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
      console.error("🧨 Error en login:", err)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-white p-4">
      <div className="absolute top-4 left-4 right-4 max-w-md mx-auto">
        <DbConnectionStatus />
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="logo-login">
              <Logo width={140} height={140} priority />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-800">Que Viva El Fútbol</CardTitle>
          <CardDescription className="text-gray-600">Ingresa a tu cuenta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Crear Cuenta
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
