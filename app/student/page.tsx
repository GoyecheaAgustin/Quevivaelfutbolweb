"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, CreditCard, QrCode, Download, LogOut, Loader2 } from "lucide-react"
import { signOut, getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { getUserByUserId, getFees } from "@/lib/database"
import PaymentInterface from "@/components/payment-interface"
import { LogoCompact } from "@/components/logo"

export default function UserDashboard() {
  const [studentData, setUserData] = useState<any>(null)
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError("")

      // Obtener usuario actual
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }

      // Obtener datos del estudiante usando la nueva función específica
      const student = await getUserByUserId(currentUser.id)

      if (!student) {
        setError("No se encontraron datos del estudiante. Contacta al administrador.")
        return
      }

      setUserData({
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        firstName: student.first_name,
        lastName: student.last_name,
        email: currentUser.email,
        category: student.category,
        status: student.status,
        qrCode: student.qr_code,
        phone: student.phone,
        parentName: student.parent_name,
        parentPhone: student.parent_phone,
        parentEmail: student.parent_email,
        address: student.address,
        enrollmentDate: student.enrollment_date,
        notes: student.notes,
      })

      // Obtener cuotas del estudiante
      const studentFees = await getFees(student.id)
      setFees(studentFees || [])
    } catch (err: any) {
      console.error("Error loading student data:", err)
      setError(`Error al cargar los datos: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "pending_approval":
        return <Badge className="bg-orange-100 text-orange-800">Pendiente Aprobación</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rechazado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getNextPayment = () => {
    const pendingFees = fees.filter((f) => f.status === "pending")
    if (pendingFees.length === 0) return null

    // Ordenar por fecha de vencimiento y tomar la más próxima
    const sortedFees = pendingFees.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    return sortedFees[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando datos del estudiante...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={loadUserData} variant="outline" className="w-full bg-transparent">
                Reintentar
              </Button>
              <Button onClick={() => router.push("/login")} className="w-full">
                Volver al Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No se pudieron cargar los datos del estudiante</p>
          <Button onClick={() => router.push("/login")}>Volver al Login</Button>
        </div>
      </div>
    )
  }

  const nextPayment = getNextPayment()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <LogoCompact width={50} height={50} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
                <p className="text-sm text-gray-500">Que Viva El Fútbol - Bienvenido, {studentData.name}</p>
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
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{studentData.status}</div>
              <p className="text-xs text-muted-foreground">Año: {studentData.category}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Pago</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {nextPayment ? (
                <>
                  <div className="text-2xl font-bold">${nextPayment.amount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Vence: {nextPayment.due_date}</p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">Al día</div>
                  <p className="text-xs text-muted-foreground">Sin pagos pendientes</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Código QR</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentData.qrCode}</div>
              <p className="text-xs text-muted-foreground">Para identificación</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
            <TabsTrigger value="news">Noticias</TabsTrigger>
            <TabsTrigger value="qr">Mi QR</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Tus datos personales y estado de inscripción</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                    <p className="text-lg">{studentData.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-lg">{studentData.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Año de Nacimiento</label>
                    <p className="text-lg">{studentData.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Estado</label>
                    <p className="text-lg capitalize">{studentData.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Teléfono</label>
                    <p className="text-lg">{studentData.phone || "No registrado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha de Inscripción</label>
                    <p className="text-lg">
                      {studentData.enrollmentDate
                        ? new Date(studentData.enrollmentDate).toLocaleDateString()
                        : "No registrada"}
                    </p>
                  </div>
                </div>

                {studentData.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dirección</label>
                    <p className="text-lg">{studentData.address}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Datos del Padre/Tutor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nombre</label>
                      <p className="text-lg">{studentData.parentName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="text-lg">{studentData.parentPhone}</p>
                    </div>
                    {studentData.parentEmail && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-lg">{studentData.parentEmail}</p>
                      </div>
                    )}
                  </div>
                </div>

                {studentData.notes && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-700">Observaciones</label>
                    <p className="text-lg">{studentData.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Estado de Pagos</h2>
              {nextPayment && (
                <PaymentInterface
                  fee={{
                    id: nextPayment.id,
                    month: nextPayment.month_year,
                    amount: nextPayment.amount,
                    dueDate: nextPayment.due_date,
                    status: nextPayment.status,
                  }}
                  onPaymentComplete={loadUserData}
                />
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historial de Cuotas</CardTitle>
                <CardDescription>Estado de tus pagos mensuales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fees.length > 0 ? (
                    fees.map((fee) => (
                      <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium">{fee.month_year}</p>
                              <p className="text-sm text-gray-500">Vence: {fee.due_date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${fee.amount.toLocaleString()}</p>
                              {fee.payment_date && (
                                <p className="text-sm text-gray-500">
                                  Pagado: {new Date(fee.payment_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(fee.status)}
                          {fee.status === "paid" && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {fee.status === "pending" && (
                            <PaymentInterface
                              fee={{
                                id: fee.id,
                                month: fee.month_year,
                                amount: fee.amount,
                                dueDate: fee.due_date,
                                status: fee.status,
                              }}
                              onPaymentComplete={loadUserData}
                            />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay cuotas registradas</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Noticias y Comunicados</CardTitle>
                <CardDescription>Últimas novedades de Que Viva El Fútbol - Profe Beto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-semibold">Sistema Inicializado</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      El sistema ha sido configurado correctamente. Ya puedes gestionar tus pagos y ver tu información.
                    </p>
                    <p className="text-xs text-gray-500">Sistema</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mi Código QR</CardTitle>
                <CardDescription>Usa este código para identificarte en la cancha</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-white p-8 rounded-lg border-2 border-gray-200 inline-block">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="h-32 w-32 text-gray-400" />
                  </div>
                  <p className="font-mono text-lg font-bold">{studentData.qrCode}</p>
                </div>
                <div className="mt-6 space-x-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar QR
                  </Button>
                  <Button variant="outline">Compartir</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
