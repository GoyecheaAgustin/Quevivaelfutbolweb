import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, CreditCard, Calendar, Bell, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-green-600 p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Escuela de Fútbol</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema integral de gestión para escuelas deportivas. Administra alumnos, pagos, asistencia y comunicaciones
            desde una sola plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3">
                Acceder al Sistema
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Funcionalidades Principales</h2>
            <p className="text-lg text-gray-600">Todo lo que necesitas para gestionar tu escuela deportiva</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>Gestión de Alumnos</CardTitle>
                <CardDescription>
                  Administra perfiles completos, categorías, estados de inscripción y datos personales
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CreditCard className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Control de Pagos</CardTitle>
                <CardDescription>
                  Gestiona cuotas, pagos online, comprobantes y estados de deuda automáticamente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Registro de Asistencia</CardTitle>
                <CardDescription>Control diario de asistencia con códigos QR y estadísticas detalladas</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Bell className="h-10 w-10 text-orange-600 mb-4" />
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>
                  Avisos automáticos por email y WhatsApp para pagos, eventos y comunicados
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-red-600 mb-4" />
                <CardTitle>Reportes y Estadísticas</CardTitle>
                <CardDescription>Informes detallados de ingresos, asistencia y rendimiento general</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <GraduationCap className="h-10 w-10 text-indigo-600 mb-4" />
                <CardTitle>Portal del Alumno</CardTitle>
                <CardDescription>
                  Acceso personalizado para alumnos y padres con toda la información necesaria
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">¿Listo para digitalizar tu escuela?</h2>
          <p className="text-xl text-green-100 mb-8">Únete a las escuelas que ya confían en nuestro sistema</p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-600 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-gray-400">© 2024 Escuela de Fútbol - Sistema de Gestión Deportiva</p>
        </div>
      </footer>
    </div>
  )
}
