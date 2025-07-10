"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, FileText, LogOut } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import AttendanceManagement from "@/components/attendance-management"

export default function CoachDashboard() {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel del Entrenador</h1>
                <p className="text-sm text-gray-500">Gestión de entrenamientos y asistencia</p>
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
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">En todas las categorías</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18/24</div>
              <p className="text-xs text-muted-foreground">75% de asistencia</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Entrenamiento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16:00</div>
              <p className="text-xs text-muted-foreground">Sub-15 - Cancha 1</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance">Asistencia</TabsTrigger>
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="notes">Observaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <AttendanceManagement />
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
