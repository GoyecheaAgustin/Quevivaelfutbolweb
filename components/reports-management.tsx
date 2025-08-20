"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, FileText, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getGeneralStats, getStudentStats, getUsers } from "@/lib/database"
import { downloadPdf } from "@/lib/pdf-generator" // Reutilizar funciones de PDF
import html2pdf from "html2pdf.js" // Declare the variable here

interface Student {
  id: string
  first_name: string
  last_name: string
  email: string
}

export default function ReportsManagement() {
  const [reportType, setReportType] = useState<string>("")
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Cargar la lista de estudiantes al inicio
  useState(() => {
    const loadStudents = async () => {
      try {
        const allUsers = await getUsers()
        const studentUsers = allUsers.filter((u: any) => u.role === "student")
        setStudents(studentUsers)
      } catch (err: any) {
        console.error("Error loading students for reports:", err)
        setError("Error al cargar la lista de estudiantes.")
      }
    }
    loadStudents()
  }, [])

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let blob: Blob | null = null
      let filename = "reporte.pdf"

      switch (reportType) {
        case "general_stats":
          const generalStats = await getGeneralStats()
          // Aquí deberías tener una función para generar un PDF de estadísticas generales
          // Por simplicidad, vamos a generar un PDF simple con los datos
          const generalHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="text-align: center;">Reporte General de la Escuela</h2>
              <h3>Usuarios:</h3>
              <p>Total: ${generalStats.users.total}</p>
              <p>Activos: ${generalStats.users.active}</p>
              <h3>Pagos:</h3>
              <p>Pagadas: ${generalStats.payments.paid}</p>
              <p>Pendientes: ${generalStats.payments.pending}</p>
              <p>Ingresos: $${generalStats.payments.revenue?.toFixed(2)}</p>
              <h3>Asistencia Hoy:</h3>
              <p>Presentes: ${generalStats.attendance.today.present}</p>
              <p>Total: ${generalStats.attendance.today.total}</p>
              <p>Tasa: ${generalStats.attendance.today.rate}%</p>
            </div>
          `
          blob = await html2pdf().from(generalHtml).outputPdf("blob")
          filename = "reporte_general.pdf"
          break
        case "student_stats":
          if (!selectedStudentId) {
            setError("Por favor, selecciona un estudiante para el reporte.")
            setLoading(false)
            return
          }
          const studentStats = await getStudentStats(selectedStudentId)
          const student = students.find((s) => s.id === selectedStudentId)
          if (!student) {
            setError("Estudiante no encontrado.")
            setLoading(false)
            return
          }
          const studentHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="text-align: center;">Reporte de Estudiante: ${student.first_name} ${student.last_name}</h2>
              <h3>Asistencia:</h3>
              <p>Total Sesiones: ${studentStats.attendance.total}</p>
              <p>Sesiones Presente: ${studentStats.attendance.present}</p>
              <p>Tasa de Asistencia: ${studentStats.attendance.rate}%</p>
              <h3>Pagos:</h3>
              <p>Total Cuotas: ${studentStats.payments.total}</p>
              <p>Cuotas Pagadas: ${studentStats.payments.paid}</p>
              <p>Cuotas Pendientes: ${studentStats.payments.pending}</p>
              <p>Tasa de Pago: ${studentStats.payments.rate}%</p>
            </div>
          `
          blob = await html2pdf().from(studentHtml).outputPdf("blob")
          filename = `reporte_estudiante_${student.first_name}_${student.last_name}.pdf`
          break
        case "payment_receipt":
          // Esto es más para un recibo individual, no un reporte masivo.
          // Podrías necesitar un ID de cuota aquí.
          setError("Esta opción requiere un ID de cuota específico. Usa la gestión de pagos para recibos individuales.")
          setLoading(false)
          return
        case "certificate":
          // Esto es para un certificado individual.
          // Podrías necesitar más datos para el certificado.
          setError("Esta opción requiere datos específicos para el certificado. No es un reporte masivo.")
          setLoading(false)
          return
        default:
          setError("Tipo de reporte no válido.")
          setLoading(false)
          return
      }

      if (blob) {
        await downloadPdf(blob, filename)
        setSuccess("Reporte generado y descargado exitosamente.")
      } else {
        setError("No se pudo generar el reporte.")
      }
    } catch (err: any) {
      console.error("Error generating report:", err)
      setError(err.message || "Error al generar el reporte.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" /> Generación de Reportes
        </CardTitle>
        <CardDescription>Genera diversos reportes en formato PDF.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleGenerateReport} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Tipo de Reporte</Label>
            <Select value={reportType} onValueChange={setReportType} disabled={loading}>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Selecciona un tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general_stats">Estadísticas Generales</SelectItem>
                <SelectItem value="student_stats">Estadísticas por Estudiante</SelectItem>
                {/* <SelectItem value="payment_receipt">Recibo de Pago (Individual)</SelectItem> */}
                {/* <SelectItem value="certificate">Certificado (Individual)</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          {reportType === "student_stats" && (
            <div className="space-y-2">
              <Label htmlFor="studentSelect">Seleccionar Estudiante</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={loading}>
                <SelectTrigger id="studentSelect">
                  <SelectValue placeholder="Selecciona un estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !reportType || (reportType === "student_stats" && !selectedStudentId)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Generar y Descargar Reporte
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
