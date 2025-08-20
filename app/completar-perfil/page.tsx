"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { updateUser } from "@/lib/database"
import { Textarea } from "@/components/ui/textarea"
import { XCircle } from "lucide-react"

export default function CompleteProfilePage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    dob: "", // Date of Birth
    phone: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    address: "",
    category: "", // This will be derived from DOB or selected
    notes: "",
  })

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        if (currentUser?.profile_completed) {
          // Si el perfil ya está completo, redirigir al dashboard
          router.push("/student")
          return
        }

        // Si el usuario existe en auth.users pero no tiene perfil en public.users,
        // o si profile_completed es false, precargar email
        if (currentUser?.email) {
          setProfileData((prev) => ({ ...prev, email: currentUser.email }))
        }
      } catch (err: any) {
        console.error("Error loading user for profile completion:", err)
        setError(err.message || "Error al cargar datos de usuario.")
        router.push("/login") // Redirigir al login si no hay usuario
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [router])

  const calculateCategory = (dob: string) => {
    if (!dob) return ""
    const birthDate = new Date(dob)
    const currentYear = new Date().getFullYear()
    const birthYear = birthDate.getFullYear()
    // Ejemplo simple: categoría por año de nacimiento. Ajustar según la lógica real de la escuela.
    return `${birthYear}-${birthYear + 1}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    if (!user?.id) {
      setError("ID de usuario no disponible. Por favor, inicia sesión de nuevo.")
      setSubmitting(false)
      return
    }

    try {
      // Actualizar la tabla 'users' con los datos del perfil
      const updatedUser = await updateUser(user.id, {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        dob: profileData.dob,
        phone: profileData.phone,
        parent_name: profileData.parent_name,
        parent_phone: profileData.parent_phone,
        parent_email: profileData.parent_email,
        address: profileData.address,
        category: profileData.category || calculateCategory(profileData.dob), // Usar la calculada si no se selecciona
        notes: profileData.notes,
        profile_completed: true, // Marcar el perfil como completo
        // No actualizar email ni auth_id aquí, ya están en la tabla users
      })

      setSuccess("¡Perfil completado exitosamente!")
      setTimeout(() => router.push("/student"), 2000) // Redirigir al dashboard
    } catch (err: any) {
      console.error("Error completing profile:", err)
      setError(err.message || "Error al completar el perfil. Intenta nuevamente.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-blue-800">Cargando perfil...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4 text-red-800">
        <XCircle className="h-10 w-10 mb-4" />
        <h2 className="text-xl font-bold mb-2">Acceso denegado</h2>
        <p className="text-center">Debes iniciar sesión para completar tu perfil.</p>
        <Button onClick={() => router.push("/login")} className="mt-4">
          Ir a Login
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-3xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-800">Completa tu Perfil</CardTitle>
          <CardDescription>Por favor, proporciona tus datos para finalizar tu registro.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre(s) *</Label>
                <Input
                  id="first_name"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, first_name: e.target.value }))}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido(s) *</Label>
                <Input
                  id="last_name"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, last_name: e.target.value }))}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Fecha de Nacimiento *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={profileData.dob}
                  onChange={(e) => {
                    setProfileData((prev) => ({ ...prev, dob: e.target.value }))
                    // Actualizar categoría al cambiar la fecha de nacimiento
                    setProfileData((prev) => ({ ...prev, category: calculateCategory(e.target.value) }))
                  }}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono del Estudiante</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                  disabled={submitting}
                  placeholder="Ej: +54911..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData((prev) => ({ ...prev, address: e.target.value }))}
                disabled={submitting}
                placeholder="Calle, Número, Ciudad, País"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent_name">Nombre del Padre/Tutor *</Label>
                <Input
                  id="parent_name"
                  value={profileData.parent_name}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, parent_name: e.target.value }))}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent_phone">Teléfono del Padre/Tutor *</Label>
                <Input
                  id="parent_phone"
                  type="tel"
                  value={profileData.parent_phone}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, parent_phone: e.target.value }))}
                  required
                  disabled={submitting}
                  placeholder="Ej: +54911..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_email">Email del Padre/Tutor</Label>
              <Input
                id="parent_email"
                type="email"
                value={profileData.parent_email}
                onChange={(e) => setProfileData((prev) => ({ ...prev, parent_email: e.target.value }))}
                disabled={submitting}
                placeholder="padre@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría (calculada por fecha de nacimiento)</Label>
              <Input
                id="category"
                value={profileData.category}
                readOnly
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                value={profileData.notes}
                onChange={(e) => setProfileData((prev) => ({ ...prev, notes: e.target.value }))}
                disabled={submitting}
                placeholder="Alergias, condiciones médicas, etc."
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

            <Button
              type="submit"
              className={`w-full ${submitting ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} shadow-lg`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Completar Perfil"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
