import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Calendar, Bell, BarChart3, Trophy } from "lucide-react"
import { LogoHero, LogoFooter } from "@/components/logo"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="logo-hero-glow">
              <LogoHero priority />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Que Viva El Fútbol</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema integral de gestión deportiva. Administra alumnos, pagos, asistencia y comunicaciones desde una sola
            plataforma profesional.
          </p>
          <div className="flex justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 shadow-lg">
                Acceder al Sistema
              </Button>
            </Link>
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
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 card-hover">
              <CardHeader>
                <Users className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Gestión de Alumnos</CardTitle>
                <CardDescription>
                  Administra perfiles completos, categorías por año de nacimiento, estados de inscripción y datos
                  personales
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 card-hover">
              <CardHeader>
                <CreditCard className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>Control de Pagos</CardTitle>
                <CardDescription>
                  Gestiona cuotas, pagos por transferencia con comprobantes y sistema de aprobación automático
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 card-hover">
              <CardHeader>
                <Calendar className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Registro de Asistencia</CardTitle>
                <CardDescription>
                  Control diario de asistencia con códigos QR únicos y estadísticas detalladas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500 card-hover">
              <CardHeader>
                <Bell className="h-10 w-10 text-orange-600 mb-4" />
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>
                  Avisos automáticos por email y WhatsApp para pagos, eventos y comunicados importantes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500 card-hover">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-red-600 mb-4" />
                <CardTitle>Reportes y Estadísticas</CardTitle>
                <CardDescription>
                  Informes detallados de ingresos, asistencia y rendimiento general de la escuela
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500 card-hover">
              <CardHeader>
                <Trophy className="h-10 w-10 text-indigo-600 mb-4" />
                <CardTitle>Portal del Alumno</CardTitle>
                <CardDescription>
                  Acceso personalizado para alumnos y padres con toda la información necesaria y pagos online
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">¿Listo para digitalizar tu escuela?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a las escuelas que ya confían en nuestro sistema profesional
          </p>
          <Link href="/login">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
            >
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <LogoFooter />
          </div>
          <h3 className="text-xl font-bold mb-2">Que Viva El Fútbol</h3>
          <p className="text-gray-400">© 2024 Escuela de Fútbol - Sistema de Gestión Deportiva Profesional</p>
        </div>
      </footer>
    </div>
  )
}
