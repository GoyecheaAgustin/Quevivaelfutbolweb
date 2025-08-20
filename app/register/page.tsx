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
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import { LogoRegister } from "@/components/logo"
import { createUserUserAction } from "@/app/actions/register"

// Función para obtener el año de nacimiento como categoría
function calculateCategory(birthDate: string): string {
  const birth = new Date(birthDate)
  return birth.getFullYear().toString()
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    address: "",
    notes: "",
  })

  const [calculatedCategory, setCalculatedCategory] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Si cambia la fecha de nacimiento, recalcular la categoría
    if (field === "date_of_birth" && value) {
      const category = calculateCategory(value)
      setCalculatedCategory(category)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Validaciones básicas
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Las contraseñas no coinciden")
      }

      if (formData.password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres")
      }

      // Verificar campos obligatorios
      const requiredFields = [
        "email",
        "password",
        "first_name",
        "last_name",
        "date_of_birth",
        "parent_name",
        "parent_phone",
      ]

      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]?.trim()) {
          throw new Error(`El campo ${field} es obligatorio`)
        }
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        throw new Error("Por favor ingresa un email válido")
      }

      // Validar fecha de nacimiento y calcular categoría
      const birthDate = new Date(formData.date_of_birth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()

      if (age < 4 || age > 18) {
        throw new Error("La edad debe estar entre 4 y 18 años")
      }

      const category = calculateCategory(formData.date_of_birth)

      console.log("Enviando datos:", {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        category: category,
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
      })

      const result = await createUserUserAction(formData.email, formData.password, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        phone: formData.phone || undefined,
        parent_name: formData.parent_name,
        parent_phone: formData.parent_phone,
        parent_email: formData.parent_email || undefined,
        address: formData.address || undefined,
        category: category, // Usar el año de nacimiento como categoría
        notes: formData.notes || undefined,
      })

      if (result.success) {
        setSuccess(result.message)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Error al crear la cuenta. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-green-50 to-white p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">¡Registro Exitoso!</h2>
            <p className="text-gray-600 mb-6">{success}</p>
            <p className="text-sm text-gray-500">Redirigiendo al login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-green-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <LogoRegister priority />
            </div>
            <CardTitle className="text-2xl font-bold text-purple-800">Registro de Estudiante</CardTitle>
            <CardDescription>Completa todos los datos para crear tu cuenta</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos de Acceso */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Datos de Acceso</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="tu@email.com"
                      required
                      disabled={loading}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={loading}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Repite la contraseña"
                      required
                      disabled={loading}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Datos del Estudiante */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Datos del Estudiante</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input
                      id="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      placeholder="Nombre del estudiante"
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
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      placeholder="Apellido del estudiante"
                      required
                      disabled={loading}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Fecha de Nacimiento *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                      required
                      disabled={loading}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono del Estudiante</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Opcional"
                      disabled={loading}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  {/* Mostrar categoría calculada automáticamente */}
                  {calculatedCategory && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Categoría (año de nacimiento)</Label>
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <span className="text-purple-800 font-medium text-lg">{calculatedCategory}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Datos del Responsable */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Datos del Responsable</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent_name">Nombre del Responsable *</Label>
                    <Input
                      id="parent_name"
                      type="text"
                      value={formData.parent_name}
                      onChange={(e) => handleInputChange("parent_name", e.target.value)}
                      placeholder="Nombre completo"
                      required
                      disabled={loading}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent_phone">Teléfono del Responsable *</Label>
                    <Input
                      id="parent_phone"
                      type="tel"
                      value={formData.parent_phone}
                      onChange={(e) => handleInputChange("parent_phone", e.target.value)}
                      placeholder="Número de contacto"
                      required
                      disabled={loading}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="parent_email">Email del Responsable</Label>
                    <Input
                      id="parent_email"
                      type="email"
                      value={formData.parent_email}
                      onChange={(e) => handleInputChange("parent_email", e.target.value)}
                      placeholder="email@ejemplo.com (opcional)"
                      disabled={loading}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Dirección completa (opcional)"
                      disabled={loading}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Información médica, alergias, observaciones especiales... (opcional)"
                      disabled={loading}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      rows={3}
                    />
                  </div>
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
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                  Inicia sesión aquí
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
    </div>
  )
}
