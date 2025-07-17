"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, FileText, LogOut, Loader2 } from "lucide-react"
import { signOut, getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import AttendanceManagement from "@/components/attendance-management"
import PaymentApproval from "@/components/payment-approval"
import { getStudents, getAttendance } from "@/lib/database"
import { useEffect, useState } from "react"
// Cambiar la importación del logo
import { LogoCompact } from "@/components/logo"

export default function CoachDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    attendanceRate: 0,
  })

  useEffect(() => {
    loadUserAndStats()
  }, [])

  const loadUserAndStats = async () => {
    try {
      setLoading(true)

      // Obtener usuario actual
      const user = await getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }

      if (user.role !== "coach") {
        router.push("/dashboard")
        return
      }

      setCurrentUser(user)

      // Cargar estadísticas
      const [studentsData, attendanceData] = await Promise.all([
        getStudents(),
        getAttendance(new Date().toISOString().split("T")[0]),
      ])

      const activeStudents = studentsData?.filter((s) => s.status === "active") || []
      const todayAttendance = attendanceData || []
      const presentCount = todayAttendance.filter((a) => a.present).length

      setStats({
        totalStudents: activeStudents.length,
        presentToday: presentCount,
        attendanceRate: activeStudents.length > 0 ? Math.round((presentCount / activeStudents.length) * 100) : 0,
      })
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {/* En el header, cambiar Logo por LogoCompact */}
              <LogoCompact width={50} height={50} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel del Entrenador</h1>
                <p className="text-sm text-gray-500">Que Viva El Fútbol - {currentUser?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">En todas las categorías</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.presentToday}/{stats.totalStudents}
              </div>
              <p className="text-xs text-muted-foreground">{stats.attendanceRate}% de asistencia</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Entrenamiento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16:00</div>
              <p className="text-xs text-muted-foreground">Entrenamiento general</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attendance">Asistencia</TabsTrigger>
            <TabsTrigger value="approvals">Aprobaciones</TabsTrigger>
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="notes">Observaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <AttendanceManagement />
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <PaymentApproval />
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Estudiantes</CardTitle>
                <CardDescription>Estudiantes bajo tu supervisión</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Vista de estudiantes disponible próximamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Observaciones y Notas</CardTitle>
                <CardDescription>Registra observaciones sobre los estudiantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sistema de observaciones disponible próximamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
