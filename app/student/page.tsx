"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, CreditCard, QrCode, Download, Upload, LogOut } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import PaymentInterface from "@/components/payment-interface"

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState({
    name: "Juan Pérez",
    category: "Sub-15",
    status: "Activo",
    nextPayment: "2024-02-15",
    qrCode: "STU-001-2024",
  })

  const [fees, setFees] = useState([
    {
      id: 1,
      month: "Enero 2024",
      amount: 15000,
      dueDate: "2024-01-15",
      status: "paid",
      paymentDate: "2024-01-10",
    },
    {
      id: 2,
      month: "Febrero 2024",
      amount: 15000,
      dueDate: "2024-02-15",
      status: "pending",
      paymentDate: null,
    },
  ])

  const router = useRouter()

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
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
                <p className="text-sm text-gray-500">Bienvenido, {studentData.name}</p>
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
              <div className="text-2xl font-bold">{studentData.status}</div>
              <p className="text-xs text-muted-foreground">Categoría: {studentData.category}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Pago</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$15.000</div>
              <p className="text-xs text-muted-foreground">Vence: {studentData.nextPayment}</p>
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
                    <label className="text-sm font-medium text-gray-700">Categoría</label>
                    <p className="text-lg">{studentData.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Estado</label>
                    <p className="text-lg">{studentData.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha de Inscripción</label>
                    <p className="text-lg">15/01/2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Estado de Pagos</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Pagar Cuota
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historial de Cuotas</CardTitle>
                <CardDescription>Estado de tus pagos mensuales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fees.map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{fee.month}</p>
                            <p className="text-sm text-gray-500">Vence: {fee.dueDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${fee.amount.toLocaleString()}</p>
                            {fee.paymentDate && <p className="text-sm text-gray-500">Pagado: {fee.paymentDate}</p>}
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
                              id: fee.id.toString(),
                              month: fee.month,
                              amount: fee.amount,
                              dueDate: fee.dueDate,
                              status: fee.status,
                            }}
                            onPaymentComplete={() => {
                              // Reload fees or update state
                              console.log("Payment completed")
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subir Comprobante</CardTitle>
                <CardDescription>Si pagaste por transferencia o efectivo, sube tu comprobante aquí</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Arrastra tu comprobante aquí o haz clic para seleccionar</p>
                  <Button variant="outline">Seleccionar Archivo</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Noticias y Comunicados</CardTitle>
                <CardDescription>Últimas novedades de la escuela</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-semibold">Entrenamiento Suspendido</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      El entrenamiento del viernes 9 de febrero queda suspendido por lluvia.
                    </p>
                    <p className="text-xs text-gray-500">Publicado hace 2 horas</p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h3 className="font-semibold">Torneo Interno</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Se realizará un torneo interno el próximo sábado. ¡No faltes!
                    </p>
                    <p className="text-xs text-gray-500">Publicado hace 1 día</p>
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
