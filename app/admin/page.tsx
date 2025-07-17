"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, DollarSign, Calendar, BarChart3, LogOut, Loader2, Clock } from "lucide-react"
import { signOut, getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { getusers, getFees } from "@/lib/database"
import UserManagement from "@/components/student-management"
import PaymentManagement from "@/components/payment-management"
import PaymentApproval from "@/components/payment-approval"
import AttendanceManagement from "@/components/attendance-management"
import NewsManagement from "@/components/news-management"
import ReportsManagement from "@/components/reports-management"
import UserManagement from "@/components/user-management"
// Cambiar la importación del logo
import { LogoCompact } from "@/components/logo"

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalusers: 0,
    activeusers: 0,
    pendingPayments: 0,
    pendingApprovals: 0,
    monthlyRevenue: 0,
  })
  const router = useRouter()

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

      if (user.role !== "admin") {
        router.push("/dashboard")
        return
      }

      setCurrentUser(user)

      // Cargar estadísticas
      const [usersData, feesData] = await Promise.all([getusers(), getFees()])

      const users = usersData || []
      const fees = feesData || []

      const activeusers = users.filter((s) => s.status === "active")
      const pendingFees = fees.filter((f) => f.status === "pending")
      const pendingApprovals = fees.filter((f) => f.status === "pending_approval")
      const paidFees = fees.filter((f) => f.status === "paid")

      // Calcular ingresos del mes actual
      const currentMonth = new Date().toISOString().slice(0, 7)
      const monthlyRevenue = paidFees.filter((f) => f.month_year === currentMonth).reduce((sum, f) => sum + f.amount, 0)

      setStats({
        totalusers: users.length,
        activeusers: activeusers.length,
        pendingPayments: pendingFees.length,
        pendingApprovals: pendingApprovals.length,
        monthlyRevenue: monthlyRevenue,
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
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalusers}</div>
              <p className="text-xs text-muted-foreground">{stats.activeusers} activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">Cuotas por cobrar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes Aprobación</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">Comprobantes por revisar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Mes actual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Promedio semanal</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="users">Alumnos</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
            <TabsTrigger value="approvals" className="relative">
              Aprobaciones
              {stats.pendingApprovals > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.pendingApprovals}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="attendance">Asistencia</TabsTrigger>
            <TabsTrigger value="news">Noticias</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <PaymentApproval />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <AttendanceManagement />
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <NewsManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
