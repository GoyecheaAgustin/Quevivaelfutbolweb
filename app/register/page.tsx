"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { signUp } from "@/lib/auth"
import { GraduationCap, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("student")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      await signUp(email, password, role)
      setSuccess("Usuario creado exitosamente. Puedes iniciar sesión ahora.")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Error al crear el usuario")
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
          <CardTitle className="text-2xl font-bold text-green-800">Crear Cuenta</CardTitle>
          <CardDescription>Regístrate en la Escuela de Fútbol</CardDescription>
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
              <Label htmlFor="role">Tipo de Usuario</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Alumno/Padre</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="coach">Entrenador</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                Iniciar Sesión
              </Link>
            </p>

            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
