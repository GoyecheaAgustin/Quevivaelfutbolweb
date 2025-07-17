"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, Calendar, DollarSign, Users, TrendingUp } from "lucide-react"
import { getusers, getFees, getAttendance } from "@/lib/database"
import { generateReport, downloadPDF } from "@/lib/pdf-generator"

export default function ReportsManagement() {
  const [users, setusers] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersData, feesData, attendanceData] = await Promise.all([getusers(), getFees(), getAttendance()])

      setusers(usersData || [])
      setFees(feesData || [])
      setAttendance(attendanceData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateFinancialReport = async () => {
    const monthlyFees = fees.filter((fee) => fee.month_year === selectedMonth)
    const totalRevenue = monthlyFees.filter((f) => f.status === "paid").reduce((sum, f) => sum + f.amount, 0)
    const pendingAmount = monthlyFees.filter((f) => f.status === "pending").reduce((sum, f) => sum + f.amount, 0)

    const reportData = {
      month: selectedMonth,
      totalRevenue,
      pendingAmount,
      paidFees: monthlyFees.filter((f) => f.status === "paid").length,
      pendingFees: monthlyFees.filter((f) => f.status === "pending").length,
      details: monthlyFees,
    }

    const pdfBlob = await generateReport("financial", reportData)
    downloadPDF(pdfBlob, `reporte-financiero-${selectedMonth}.pdf`)
  }

  const generateDebtorsReport = async () => {
    const debtors = fees.filter((fee) => fee.status === "pending" || fee.status === "overdue")
    const debtorsByUser = debtors.reduce((acc, fee) => {
      const studentName = `${fee.users?.first_name} ${fee.users?.last_name}`
      if (!acc[studentName]) {
        acc[studentName] = { name: studentName, debt: 0, fees: [] }
      }
      acc[studentName].debt += fee.amount
      acc[studentName].fees.push(fee)
      return acc
    }, {} as any)

    const reportData = {
      totalDebtors: Object.keys(debtorsByUser).length,
      totalDebt: Object.values(debtorsByUser).reduce((sum: number, debtor: any) => sum + debtor.debt, 0),
      debtors: Object.values(debtorsByUser),
    }

    const pdfBlob = await generateReport("debtors", reportData)
    downloadPDF(pdfBlob, `reporte-deudores-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const generateAttendanceReport = async () => {
    const monthStart = new Date(selectedMonth + "-01")
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

    const monthlyAttendance = attendance.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate >= monthStart && recordDate <= monthEnd
    })

    const attendanceByUser = monthlyAttendance.reduce((acc, record) => {
      const studentName = `${record.users?.first_name} ${record.users?.last_name}`
      if (!acc[studentName]) {
        acc[studentName] = { name: studentName, present: 0, total: 0 }
      }
      acc[studentName].total += 1
      if (record.present) acc[studentName].present += 1
      return acc
    }, {} as any)

    const reportData = {
      month: selectedMonth,
      totalSessions: new Set(monthlyAttendance.map((r) => r.date)).size,
      averageAttendance:
        (Object.values(attendanceByUser).reduce(
          (sum: number, student: any) => sum + student.present / student.total,
          0,
        ) /
          Object.keys(attendanceByUser).length) *
        100,
      studentAttendance: Object.values(attendanceByUser),
    }

    const pdfBlob = await generateReport("attendance", reportData)
    downloadPDF(pdfBlob, `reporte-asistencia-${selectedMonth}.pdf`)
  }

  // Calcular estadísticas
  const totalusers = users.length
  const activeusers = users.filter((s) => s.status === "active").length
  const totalRevenue = fees.filter((f) => f.status === "paid").reduce((sum, f) => sum + f.amount, 0)
  const pendingPayments = fees.filter((f) => f.status === "pending").length
  const averageAttendance =
    attendance.length > 0 ? Math.round((attendance.filter((a) => a.present).length / attendance.length) * 100) : 0

  const debtorsList = fees
    .filter((fee) => fee.status === "pending" || fee.status === "overdue")
    .reduce((acc, fee) => {
      const key = fee.student_id
      if (!acc[key]) {
        acc[key] = {
          studentName: `${fee.users?.first_name} ${fee.users?.last_name}`,
          totalDebt: 0,
          feesCount: 0,
        }
      }
      acc[key].totalDebt += fee.amount
      acc[key].feesCount += 1
      return acc
    }, {} as any)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reportes y Estadísticas</h2>
        <div className="flex items-center space-x-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">Enero 2024</SelectItem>
              <SelectItem value="2024-02">Febrero 2024</SelectItem>
              <SelectItem value="2024-03">Marzo 2024</SelectItem>
              <SelectItem value="2024-04">Abril 2024</SelectItem>
              <SelectItem value="2024-05">Mayo 2024</SelectItem>
              <SelectItem value="2024-06">Junio 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalusers}</div>
            <p className="text-xs text-muted-foreground">{activeusers} activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pagos recibidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Cuotas por cobrar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAttendance}%</div>
            <p className="text-xs text-muted-foreground">Promedio general</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deudores</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{Object.keys(debtorsList).length}</div>
            <p className="text-xs text-muted-foreground">Con pagos pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Reportes Financieros
            </CardTitle>
            <CardDescription>Ingresos, pagos y estadísticas monetarias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={generateFinancialReport} className="w-full bg-transparent" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Reporte Mensual
            </Button>
            <Button onClick={generateDebtorsReport} className="w-full bg-transparent" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Reporte de Deudores
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Reportes de Asistencia
            </CardTitle>
            <CardDescription>Estadísticas de asistencia y participación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={generateAttendanceReport} className="w-full bg-transparent" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Reporte Mensual
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Reporte por Estudiante
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Reportes Generales
            </CardTitle>
            <CardDescription>Estadísticas generales y comparativas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full bg-transparent" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Reporte Anual
            </Button>
            <Button className="w-full bg-transparent" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Estadísticas Comparativas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lista de deudores */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Deudores</CardTitle>
          <CardDescription>Estudiantes con pagos pendientes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Cuotas Pendientes</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(debtorsList).map((debtor: any, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{debtor.studentName}</TableCell>
                  <TableCell>{debtor.feesCount}</TableCell>
                  <TableCell className="font-bold text-red-600">${debtor.totalDebt.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className="bg-red-100 text-red-800">Pendiente</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {Object.keys(debtorsList).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay deudores registrados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
