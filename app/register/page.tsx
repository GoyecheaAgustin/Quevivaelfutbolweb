// /app/register/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { createStudentUserAction } from "@/app/actions/register"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { LogoRegister } from "@/components/logo"
import { checkUserExists } from "@/lib/auth"

export default function RegisterPage() {
  const [step, setStep] = useState(1) // 1: Cuenta, 2: Datos personales
  const [loading, setLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Datos de la cuenta
  const [accountData, setAccountData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Datos personales del estudiante
  const [studentData, setStudentData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    address: "",
    category: "",
    notes: "",
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

    setStep(2)
  }

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!studentData.first_name || !studentData.last_name) {
      setError("Nombre y apellido son obligatorios")
      return
    }

    if (!studentData.date_of_birth) {
      setError("La fecha de nacimiento es obligatoria")
      return
    }

    if (!studentData.category) {
      setError("Debes seleccionar una categoría")
      return
    }

    if (!studentData.parent_name || !studentData.parent_phone) {
      setError("Los datos del padre/tutor son obligatorios")
      return
    }

    await handleFinalSubmit({ accountData, studentData })
  }

  const handleFinalSubmit = async ({ accountData, studentData }: { accountData: any; studentData: any }) => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await createStudentUserAction(accountData.email, accountData.password, studentData)

      setSuccess(result.message)
      setStep(3)

      setAccountData({ email: "", password: "", confirmPassword: "" })
      setStudentData({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        phone: "",
        parent_name: "",
        parent_phone: "",
        parent_email: "",
        address: "",
        category: "",
        notes: "",
      })

      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Error al crear la cuenta. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const calculateCategory = (birthDate: string) => {
    if (!birthDate) return ""

    const birth = new Date(birthDate)
    const birthYear = birth.getFullYear()

    return birthYear.toString()
  }

  const handleBirthDateChange = (date: string) => {
    setStudentData((prev) => ({
      ...prev,
      date_of_birth: date,
      category: calculateCategory(date),
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-green-50 to-white p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <LogoRegister priority />
          </div>
          <CardTitle className="text-2xl font-bold text-purple-800">
            {step === 1 ? "Registro de Estudiante" : "Datos Personales"}
          </CardTitle>
          <CardDescription>
            {step === 1 ? "Crea tu cuenta en Que Viva El Fútbol" : "Completa tus datos personales"}
          </CardDescription>

          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= 1 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <div className={`w-8 h-1 transition-colors ${step >= 2 ? "bg-purple-600" : "bg-gray-200"}`}></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= 2 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="text-sm text-purple-800">
                <p className="font-medium">Solo registro de estudiantes</p>
                <p>Los administradores y entrenadores son asignados por el administrador del sistema.</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {step === 1 ? (
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
                <p className="text-xs text-gray-500">Este será tu email para iniciar sesión y recibir notificaciones</p>
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
                  <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
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
                  "Continuar"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    type="text"
                    value={studentData.first_name}
                    onChange={(e) => setStudentData((prev) => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Juan"
                    required
                    disabled={loading}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input
                    id="last_name"
                    type="text"
                    value={studentData.last_name}
                    onChange={(e) => setStudentData((prev) => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Pérez"
                    required
                    disabled={loading}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Fecha de Nacimiento *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={studentData.date_of_birth}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    required
                    disabled={loading}
                    max={new Date().toISOString().split("T")[0]}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría (Año de Nacimiento)</Label>
                  <Input
                    id="category"
                    type="text"
                    value={studentData.category}
                    placeholder="Se calcula automáticamente"
                    disabled
                    className="bg-purple-50 border-purple-200"
                  />
                  <p className="text-xs text-gray-500">Basada en tu año de nacimiento</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono del Estudiante</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={studentData.phone}
                  onChange={(e) => setStudentData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="1234567890"
                  disabled={loading}
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="border-t pt-4">
                <Label className="text-base font-semibold">Datos del Padre/Tutor *</Label>
                <p className="text-sm text-gray-500 mb-4">Información de contacto del responsable</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parent_name">Nombre del Padre/Tutor *</Label>
                  <Input
                    id="parent_name"
                    type="text"
                    value={studentData.parent_name}
                    onChange={(e) => setStudentData((prev) => ({ ...prev, parent_name: e.target.value }))}
                    placeholder="María Pérez"
                    required
                    disabled={loading}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent_phone">Teléfono del Padre/Tutor *</Label>
                  <Input
                    id="parent_phone"
                    type="tel"
                    value={studentData.parent_phone}
                    onChange={(e) => setStudentData((prev) => ({ ...prev, parent_phone: e.target.value }))}
                    placeholder="0987654321"
                    required
                    disabled={loading}
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_email">Email del Padre/Tutor (opcional)</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={studentData.parent_email}
                  onChange={(e) => setStudentData((prev) => ({ ...prev, parent_email: e.target.value }))}
                  placeholder="padre@email.com"
                  disabled={loading}
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500">Para recibir notificaciones adicionales</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  type="text"
                  value={studentData.address}
                  onChange={(e) => setStudentData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Av. Principal 123"
                  disabled={loading}
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observaciones Médicas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={studentData.notes}
                  onChange={(e) => setStudentData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Alergias, medicamentos, condiciones médicas importantes, etc."
                  rows={3}
                  disabled={loading}
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
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

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 bg-transparent border-purple-300 hover:bg-purple-50"
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className={`flex-1 ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"} shadow-lg`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
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
