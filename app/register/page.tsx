// /app/register/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { LogoRegister } from "@/components/logo"
import { signUp, checkUserExists } from "@/lib/auth"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const [accountData, setAccountData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleEmailBlur = async () => {
    if (accountData.email && accountData.email.includes("@")) {
      setCheckingEmail(true)
      try {
        const exists = await checkUserExists(accountData.email)
        if (exists) {
          setError("Ya existe una cuenta con este email")
        } else {
          setError("")
        }
      } catch (err) {
        console.error("Error checking email:", err)
        setError("Error al verificar el email")
      } finally {
        setCheckingEmail(false)
      }
    }
  }

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (accountData.password !== accountData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (accountData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (!accountData.email.includes("@")) {
      setError("Por favor ingresa un email válido")
      return
    }

    setCheckingEmail(true)
    try {
      const exists = await checkUserExists(accountData.email)
      if (exists) {
        setError("Ya existe una cuenta con este email")
        setCheckingEmail(false)
        return
      }
    } catch (err) {
      setError("Error al verificar el email")
      setCheckingEmail(false)
      return
    }
    setCheckingEmail(false)

    setLoading(true)
    try {
      await signUp(accountData.email, accountData.password)
      setSuccess("Cuenta creada con éxito. Revisa tu email para confirmar.")
      setTimeout(() => router.push("/login"), 3000)
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Error al crear la cuenta. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-green-50 to-white p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <LogoRegister priority />
          </div>
          <CardTitle className="text-2xl font-bold text-purple-800">
            Registro de Estudiante
          </CardTitle>
          <CardDescription>
            Crea tu cuenta en Que Viva El Fútbol
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={accountData.email}
                  onChange={(e) => setAccountData((prev) => ({ ...prev, email: e.target.value }))}
                  onBlur={handleEmailBlur}
                  placeholder="tu@email.com"
                  required
                  disabled={loading || checkingEmail}
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
                {checkingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={accountData.password}
                  onChange={(e) => setAccountData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={accountData.confirmPassword}
                  onChange={(e) => setAccountData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
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

            <Button
              type="submit"
              className={`w-full ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"} shadow-lg`}
              disabled={loading || checkingEmail}
            >
              {loading || checkingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {checkingEmail ? "Verificando email..." : "Procesando..."}
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta? {" "}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Iniciar Sesión
              </Link>
            </p>

            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
              <Loader2 className="h-4 w-4 mr-1" />
              Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
