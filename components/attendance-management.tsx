"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Calendar, Save, Search } from "lucide-react"
import { getAttendance, markAttendance, getUsers } from "@/lib/database"
import { format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Student {
  id: string
  first_name: string
  last_name: string
  category: string
}

interface AttendanceRecord {
  student_id: string
  date: string
  present: boolean
}

export default function AttendanceManagement() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const allUsers = await getUsers()
      const studentUsers = allUsers.filter((u: any) => u.role === "student")
      setStudents(studentUsers)

      const attendanceRecords = await getAttendance(selectedDate)
      setAttendance(attendanceRecords || [])
    } catch (err: any) {
      console.error("Error loading attendance data:", err)
      setError(err.message || "Error al cargar los datos de asistencia.")
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendance((prev) => {
      const existingIndex = prev.findIndex((record) => record.student_id === studentId)
      if (existingIndex !== -1) {
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], present: isPresent }
        return updated
      } else {
        return [...prev, { student_id: studentId, date: selectedDate, present: isPresent }]
      }
    })
  }

  const handleSaveAttendance = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      // Solo guardar los registros que han sido modificados o son nuevos
      const recordsToSave = students.map((student) => {
        const existingRecord = attendance.find((att) => att.student_id === student.id)
        return {
          student_id: student.id,
          date: selectedDate,
          present: existingRecord ? existingRecord.present : false, // Asume false si no hay registro previo
        }
      })

      await markAttendance(recordsToSave)
      setSuccess("Asistencia guardada exitosamente.")
      // Recargar para asegurar que los datos mostrados son los de la DB
      await loadData()
    } catch (err: any) {
      console.error("Error saving attendance:", err)
      setError(err.message || "Error al guardar la asistencia.")
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6" /> Gestión de Asistencia
        </CardTitle>
        <CardDescription>Registra y visualiza la asistencia de los estudiantes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Label htmlFor="attendanceDate">Fecha de Asistencia</Label>
            <Input
              id="attendanceDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1 w-full">
            <Label htmlFor="searchStudent">Buscar Estudiante</Label>
            <div className="relative">
              <Input
                id="searchStudent"
                type="text"
                placeholder="Nombre, apellido o categoría"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

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

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-4 text-lg text-blue-800">Cargando asistencia...</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-center">Presente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const isPresent = attendance.find((record) => record.student_id === student.id)?.present || false
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>{student.category}</TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={isPresent}
                            onCheckedChange={(checked) => handleAttendanceChange(student.id, checked as boolean)}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      No se encontraron estudiantes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Button onClick={handleSaveAttendance} disabled={saving || loading} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Guardar Asistencia
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
