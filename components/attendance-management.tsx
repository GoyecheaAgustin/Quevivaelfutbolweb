"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Check, X, Users } from "lucide-react"
import { getUsers, getAttendance, markAttendance } from "@/lib/database"

interface User {
  id: string
  first_name: string
  last_name: string
  category: string
  status: string
}

interface AttendanceRecord {
  student_id: string
  present: boolean
  notes?: string
}

export default function AttendanceManagement() {
  const [students, setUsers] = useState<User[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [studentsData, attendanceData] = await Promise.all([
        getUsers().catch((err) => {
          console.error("Error loading students:", err)
          return []
        }),
        getAttendance(selectedDate).catch((err) => {
          console.error("Error loading attendance:", err)
          return []
        }),
      ])

      const activeUsers = studentsData?.filter((s) => s.status === "active") || []
      setUsers(activeUsers)

      // Crear mapa de asistencia existente
      const attendanceMap = new Map()
      attendanceData?.forEach((record) => {
        attendanceMap.set(record.student_id, record.present)
      })

      // Inicializar estado de asistencia
      const initialAttendance = activeUsers.map((student) => ({
        student_id: student.id,
        present: attendanceMap.get(student.id) || false,
        notes: "",
      }))

      setAttendance(initialAttendance)
    } catch (error) {
      console.error("Error loading data:", error)
      // Establecer datos vacíos en caso de error
      setUsers([])
      setAttendance([])
      setError("Error al cargar los datos. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendance((prev) => prev.map((record) => (record.student_id === studentId ? { ...record, present } : record)))
  }

  const handleSaveAttendance = async () => {
    setSaving(true)
    try {
      const attendanceData = attendance.map((record) => ({
        student_id: record.student_id,
        date: selectedDate,
        present: record.present,
        notes: record.notes || null,
      }))

      await markAttendance(attendanceData)
      alert("Asistencia guardada exitosamente")
    } catch (error) {
      console.error("Error saving attendance:", error)
      alert("Error al guardar la asistencia")
    } finally {
      setSaving(false)
    }
  }

  const markAllPresent = () => {
    setAttendance((prev) => prev.map((record) => ({ ...record, present: true })))
  }

  const markAllAbsent = () => {
    setAttendance((prev) => prev.map((record) => ({ ...record, present: false })))
  }

  const presentCount = attendance.filter((record) => record.present).length
  const totalUsers = students.length
  const attendanceRate = totalUsers > 0 ? Math.round((presentCount / totalUsers) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Control de Asistencia</h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button onClick={handleSaveAttendance} disabled={saving} className="bg-green-600 hover:bg-green-700">
            {saving ? "Guardando..." : "Guardar Asistencia"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <Button onClick={loadData} variant="outline" size="sm" className="mt-2 bg-transparent">
            Reintentar
          </Button>
        </div>
      )}

      {/* Estadísticas del día */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Estudiantes activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentes</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground">Asistieron hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalUsers - presentCount}</div>
            <p className="text-xs text-muted-foreground">No asistieron</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Asistencia</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Del total</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Controles Rápidos</CardTitle>
          <CardDescription>Marca asistencia masiva</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button onClick={markAllPresent} variant="outline" className="bg-green-50 hover:bg-green-100">
              <Check className="h-4 w-4 mr-2" />
              Marcar Todos Presentes
            </Button>
            <Button onClick={markAllAbsent} variant="outline" className="bg-red-50 hover:bg-red-100">
              <X className="h-4 w-4 mr-2" />
              Marcar Todos Ausentes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de asistencia */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Asistencia - {selectedDate}</CardTitle>
          <CardDescription>Marca la asistencia de cada estudiante</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Presente</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const attendanceRecord = attendance.find((a) => a.student_id === student.id)
                const isPresent = attendanceRecord?.present || false

                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {student.first_name} {student.last_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={isPresent}
                        onCheckedChange={(checked) => handleAttendanceChange(student.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      {isPresent ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Presente
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <X className="h-3 w-3 mr-1" />
                          Ausente
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
