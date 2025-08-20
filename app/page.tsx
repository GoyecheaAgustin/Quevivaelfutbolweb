import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users, DollarSign, CalendarCheck } from "lucide-react"
import { LogoRegister } from "@/components/logo"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-white p-4 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <LogoRegister className="mx-auto h-24 w-auto mb-4" />
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Gestiona tu <span className="text-green-600">Escuela de Fútbol</span> con Facilidad
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            La plataforma integral para administradores, coaches y estudiantes. Simplifica la gestión, mejora la
            comunicación y potencia el rendimiento.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-full shadow-lg transition-transform transform hover:scale-105"
            >
              <Link href="/register">
                Regístrate Ahora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50 text-lg px-8 py-6 rounded-full shadow-lg transition-transform transform hover:scale-105 bg-transparent"
            >
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card className="p-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-col items-center pb-4">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle className="text-xl font-bold text-gray-800">Gestión de Estudiantes</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Administra la información de tus estudiantes, categorías y perfiles completos en un solo lugar.
            </CardContent>
          </Card>

          <Card className="p-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-col items-center pb-4">
              <DollarSign className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle className="text-xl font-bold text-gray-800">Control de Pagos</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Registra cuotas, genera recibos y envía recordatorios automáticos para mantener las finanzas al día.
            </CardContent>
          </Card>

          <Card className="p-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-col items-center pb-4">
              <CalendarCheck className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle className="text-xl font-bold text-gray-800">Registro de Asistencia</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Lleva un control preciso de la asistencia a entrenamientos y eventos con facilidad.
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-gray-500 text-sm">© 2024 Que Viva El Fútbol. Todos los derechos reservados.</div>
      </div>
    </div>
  )
}
