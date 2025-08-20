"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, QrCode, DollarSign, CalendarCheck, Newspaper, LogOut, XCircle } from "lucide-react"
import QRCodeDisplay from "@/components/qr-code-display" // Importar el componente QR
import { getCurrentUser, signOut } from "@/lib/auth"
import { getStudentStats } from "@/lib/database"

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadUserData() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        if (currentUser && currentUser.id) {
          // Asumiendo que currentUser.id es el user_id de la tabla 'users'
          const studentStats = await getStudentStats(currentUser.id)
          setStats(studentStats)
        } else {
          setError("No se pudo obtener el ID del usuario.")
        }
      } catch (err: any) {
        console.error("Error loading user data or stats:", err)
        setError(err.message || "Error al cargar los datos del estudiante.")
        // Si hay un error de autenticación, redirigir al login
        if (err.message.includes("No se pudo obtener el usuario") || err.message.includes("No se encontró el perfil")) {
          router.push("/login")
        }
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push("/login")
    } catch (err: any) {
      console.error("Error logging out:", err)
      setError(err.message || "Error al cerrar sesión.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-blue-800">Cargando dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4 text-red-800">
        <XCircle className="h-10 w-10 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error al cargar el dashboard</h2>
        <p className="text-center">{error}</p>
        <Button onClick={() => router.push("/login")} className="mt-4">
          Volver al Login
        </Button>
      </div>
    )
  }

  if (!user) {
    // Esto debería ser manejado por la redirección en loadUserData, pero como fallback
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <p className="text-lg text-gray-700">No autenticado. Redirigiendo...</p>
        <Button onClick={() => router.push("/login")} className="mt-4">
          Ir a Login
        </Button>
      </div>
    )
  }

  // Datos para el QR (ej. un enlace al perfil del estudiante o su ID)
  const qrData = `student_id:${user.id}` // Usar el ID del usuario para el QR

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">Bienvenido, {user.email}</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-500 bg-transparent"
          >
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </Button>
        </div>

        <Separator className="mb-6 bg-blue-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Tarjeta de QR Code */}
          <Card className="col-span-1 flex flex-col items-center justify-center p-4">
            <CardHeader className="text-center pb-2">
              <QrCode className="h-10 w-10 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-xl">Tu Código QR</CardTitle>
              <CardDescription>Para asistencia y pagos</CardDescription>
            </CardHeader>
            <CardContent className="w-full flex justify-center">
              <QRCodeDisplay
                data={qrData}
                title="QR de Estudiante"
                description="Escanea para registrar asistencia"
                filename={`qr_estudiante_${user.id}.png`}
              />
            </CardContent>
          </Card>

          {/* Tarjeta de Pagos */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-xl">Estado de Pagos</CardTitle>
              <CardDescription>Resumen de tus cuotas</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.payments ? (
                <div className="space-y-2">
                  <p>
                    Total Cuotas: <span className="font-semibold">{stats.payments.total}</span>
                  </p>
                  <p>
                    Cuotas Pagadas: <span className="font-semibold text-green-600">{stats.payments.paid}</span>
                  </p>
                  <p>
                    Cuotas Pendientes: <span className="font-semibold text-red-600">{stats.payments.pending}</span>
                  </p>
                  <p>
                    Tasa de Pago: <span className="font-semibold">{stats.payments.rate}%</span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Cargando datos de pagos...</p>
              )}
              <Button variant="link" className="mt-4 p-0">
                Ver historial de pagos
              </Button>
            </CardContent>
          </Card>

          {/* Tarjeta de Asistencia */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CalendarCheck className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-xl">Asistencia</CardTitle>
              <CardDescription>Tu récord de asistencia</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.attendance ? (
                <div className="space-y-2">
                  <p>
                    Sesiones Totales: <span className="font-semibold">{stats.attendance.total}</span>
                  </p>
                  <p>
                    Sesiones Presente: <span className="font-semibold text-purple-600">{stats.attendance.present}</span>
                  </p>
                  <p>
                    Tasa de Asistencia: <span className="font-semibold">{stats.attendance.rate}%</span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Cargando datos de asistencia...</p>
              )}
              <Button variant="link" className="mt-4 p-0">
                Ver calendario de asistencia
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Noticias (ejemplo) */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <Newspaper className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle className="text-xl">Últimas Noticias</CardTitle>
            <CardDescription>Mantente al día con los anuncios de la escuela</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  ¡Inscripciones abiertas para el torneo de verano!
                </a>{" "}
                - 15/07/2024
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Cambio de horario para entrenamientos de categoría 2010
                </a>{" "}
                - 10/07/2024
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Clínica de fútbol con ex-jugador profesional
                </a>{" "}
                - 01/07/2024
              </li>
            </ul>
            <Button variant="link" className="mt-4 p-0">
              Ver todas las noticias
            </Button>
          </CardContent>
        </Card>

        {/* Sección de Perfil (ejemplo) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Mi Perfil</CardTitle>
            <CardDescription>Información personal y de contacto</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Rol:</strong> {user.role}
            </p>
            {/* Aquí podrías mostrar más detalles del perfil del estudiante si los cargas */}
            <Button variant="link" className="mt-4 p-0">
              Editar perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
