"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Users, DollarSign, CalendarCheck, Newspaper, LogOut, Settings, XCircle } from "lucide-react"
import { getCurrentUser, signOut } from "@/lib/auth"
import { getGeneralStats } from "@/lib/database"
import { DbConnectionStatus } from "@/components/db-connection-status" // Importar el componente de estado de conexión

export default function AdminDashboardPage() {
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
        if (currentUser.role !== "admin") {
          setError("Acceso denegado. Solo los administradores pueden ver esta página.")
          router.push("/login") // Redirigir si no es admin
          return
        }
        setUser(currentUser)

        const generalStats = await getGeneralStats()
        setStats(generalStats)
      } catch (err: any) {
        console.error("Error loading admin data or stats:", err)
        setError(err.message || "Error al cargar los datos del administrador.")
        router.push("/login") // Redirigir al login si hay un error de autenticación
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
        <p className="ml-4 text-lg text-blue-800">Cargando dashboard de administrador...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4 text-red-800">
        <XCircle className="h-10 w-10 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error de Acceso</h2>
        <p className="text-center">{error}</p>
        <Button onClick={() => router.push("/login")} className="mt-4">
          Volver al Login
        </Button>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <p className="text-lg text-gray-700">Acceso no autorizado. Redirigiendo...</p>
        <Button onClick={() => router.push("/login")} className="mt-4">
          Ir a Login
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">Dashboard de Administrador</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-500 bg-transparent"
          >
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </Button>
        </div>

        <Separator className="mb-6 bg-blue-200" />

        {/* Estado de Conexión a la Base de Datos */}
        <div className="mb-8">
          <DbConnectionStatus />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Tarjeta de Usuarios */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-xl">Gestión de Usuarios</CardTitle>
              <CardDescription>Administra estudiantes, coaches y admins</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.users ? (
                <div className="space-y-2">
                  <p>
                    Total Usuarios: <span className="font-semibold">{stats.users.total}</span>
                  </p>
                  <p>
                    Usuarios Activos: <span className="font-semibold text-green-600">{stats.users.active}</span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Cargando datos de usuarios...</p>
              )}
              <Button variant="link" className="mt-4 p-0">
                Ir a Gestión de Usuarios
              </Button>
            </CardContent>
          </Card>

          {/* Tarjeta de Pagos */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-xl">Gestión de Pagos</CardTitle>
              <CardDescription>Controla cuotas y recibos</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.payments ? (
                <div className="space-y-2">
                  <p>
                    Cuotas Pagadas: <span className="font-semibold text-green-600">{stats.payments.paid}</span>
                  </p>
                  <p>
                    Cuotas Pendientes: <span className="font-semibold text-red-600">{stats.payments.pending}</span>
                  </p>
                  <p>
                    Ingresos Totales: <span className="font-semibold">${stats.payments.revenue?.toFixed(2)}</span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Cargando datos de pagos...</p>
              )}
              <Button variant="link" className="mt-4 p-0">
                Ir a Gestión de Pagos
              </Button>
            </CardContent>
          </Card>

          {/* Tarjeta de Asistencia */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CalendarCheck className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-xl">Gestión de Asistencia</CardTitle>
              <CardDescription>Registra y revisa la asistencia diaria</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.attendance?.today ? (
                <div className="space-y-2">
                  <p>
                    Presentes Hoy: <span className="font-semibold">{stats.attendance.today.present}</span>
                  </p>
                  <p>
                    Total Esperado Hoy: <span className="font-semibold">{stats.attendance.today.total}</span>
                  </p>
                  <p>
                    Tasa de Asistencia Hoy: <span className="font-semibold">{stats.attendance.today.rate}%</span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Cargando datos de asistencia...</p>
              )}
              <Button variant="link" className="mt-4 p-0">
                Ir a Gestión de Asistencia
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Herramientas Administrativas */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <Settings className="h-8 w-8 text-gray-600 mb-2" />
            <CardTitle className="text-xl">Herramientas Administrativas</CardTitle>
            <CardDescription>Acceso rápido a funciones clave</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start bg-transparent">
              <Newspaper className="mr-2 h-4 w-4" /> Gestionar Noticias
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              <Users className="mr-2 h-4 w-4" /> Reportes y Estadísticas
            </Button>
            <Button variant="outline" className="justify-start bg-transparent">
              <Settings className="mr-2 h-4 w-4" /> Configuración del Sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
