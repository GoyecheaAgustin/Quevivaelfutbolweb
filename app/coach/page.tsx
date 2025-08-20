"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Users, CalendarCheck, Newspaper, LogOut, XCircle } from "lucide-react"
import { getCurrentUser, signOut } from "@/lib/auth"
import { getNews, getUsers } from "@/lib/database" // Importar funciones de base de datos

export default function CoachDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadUserData() {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser.role !== "coach" && currentUser.role !== "admin") {
          setError("Acceso denegado. Solo los coaches o administradores pueden ver esta página.")
          router.push("/login") // Redirigir si no es coach o admin
          return
        }
        setUser(currentUser)

        // Cargar datos relevantes para el coach
        const allUsers = await getUsers() // Obtener todos los usuarios
        const studentUsers = allUsers.filter((u: any) => u.role === "student") // Filtrar solo estudiantes
        setStudents(studentUsers)

        const latestNews = await getNews()
        setNews(latestNews.slice(0, 3)) // Mostrar las 3 últimas noticias
      } catch (err: any) {
        console.error("Error loading coach data:", err)
        setError(err.message || "Error al cargar los datos del coach.")
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 p-4">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
        <p className="ml-4 text-lg text-green-800">Cargando dashboard de coach...</p>
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

  if (!user || (user.role !== "coach" && user.role !== "admin")) {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-800">Dashboard de Coach</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-500 bg-transparent"
          >
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </Button>
        </div>

        <Separator className="mb-6 bg-green-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Tarjeta de Gestión de Estudiantes */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-xl">Gestión de Estudiantes</CardTitle>
              <CardDescription>Lista de tus estudiantes</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {students.map((student) => (
                    <li key={student.id} className="flex justify-between items-center text-sm">
                      <span>
                        {student.first_name} {student.last_name}
                      </span>
                      <span className="text-gray-500">{student.email}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No hay estudiantes registrados.</p>
              )}
              <Button variant="link" className="mt-4 p-0">
                Ver todos los estudiantes
              </Button>
            </CardContent>
          </Card>

          {/* Tarjeta de Asistencia */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CalendarCheck className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-xl">Control de Asistencia</CardTitle>
              <CardDescription>Registra la asistencia diaria</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">Marca la asistencia de tus estudiantes para hoy.</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <CalendarCheck className="mr-2 h-4 w-4" /> Registrar Asistencia
              </Button>
              <Button variant="link" className="mt-2 p-0">
                Ver historial de asistencia
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Noticias */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <Newspaper className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle className="text-xl">Últimas Noticias</CardTitle>
            <CardDescription>Anuncios importantes para la comunidad</CardDescription>
          </CardHeader>
          <CardContent>
            {news.length > 0 ? (
              <ul className="space-y-2">
                {news.map((item) => (
                  <li key={item.id}>
                    <a href="#" className="text-blue-600 hover:underline font-medium">
                      {item.title}
                    </a>
                    <p className="text-sm text-gray-600">{item.content.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-500">
                      Publicado el {new Date(item.published_at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No hay noticias recientes.</p>
            )}
            <Button variant="link" className="mt-4 p-0">
              Ver todas las noticias
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
