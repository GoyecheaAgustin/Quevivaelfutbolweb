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
import { GraduationCap } from "lucide-react"
import Link from "next/link"

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
      await signIn(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">Escuela de Fútbol</CardTitle>
          <CardDescription>Ingresa a tu cuenta para continuar</CardDescription>
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
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
                Crear Cuenta
              </Link>
            </p>

            {/* Usuarios de prueba */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-3">Usuarios de prueba:</p>
              <div className="space-y-2 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="font-medium">👤 Administrador</p>
                  <p>Email: admin@escuela.com</p>
                  <p>Contraseña: password</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="font-medium">🎓 Alumno</p>
                  <p>Email: alumno@escuela.com</p>
                  <p>Contraseña: password</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="font-medium">⚽ Entrenador</p>
                  <p>Email: entrenador@escuela.com</p>
                  <p>Contraseña: password</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
