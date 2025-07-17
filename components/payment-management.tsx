"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Download, Mail, CreditCard, Plus } from "lucide-react"
import { getFees, createFee, updateFee, getusers } from "@/lib/database"
import { generatePaymentReceipt, downloadPDF } from "@/lib/pdf-generator"
import { sendPaymentReminder } from "@/lib/notifications"

interface Fee {
  id: string
  student_id: string
  amount: number
  due_date: string
  month_year: string
  status: string
  payment_method?: string
  payment_date?: string
  users?: { first_name: string; last_name: string }
}

export default function PaymentManagement() {
  const [fees, setFees] = useState<Fee[]>([])
  const [users, setusers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all")

  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    due_date: "",
    month_year: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [feesData, usersData] = await Promise.all([getFees(), getusers()])
      setFees(feesData || [])
      setusers(usersData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createFee({
        ...formData,
        amount: Number.parseFloat(formData.amount),
        status: "pending",
      })

      await loadData()
      setIsDialogOpen(false)
      setFormData({
        student_id: "",
        amount: "",
        due_date: "",
        month_year: "",
      })
    } catch (error) {
      console.error("Error creating fee:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (feeId: string, paymentMethod = "manual") => {
    try {
      await updateFee(feeId, {
        status: "paid",
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
      })
      await loadData()
    } catch (error) {
      console.error("Error marking as paid:", error)
    }
  }

  const handleDownloadReceipt = async (fee: Fee) => {
    try {
      const receiptData = {
        id: fee.id,
        studentName: `${fee.users?.first_name} ${fee.users?.last_name}`,
        amount: fee.amount,
        date: fee.payment_date,
        month: fee.month_year,
      }

      const pdfBlob = await generatePaymentReceipt(receiptData)
      downloadPDF(pdfBlob, `recibo-${fee.month_year}-${fee.users?.first_name}.pdf`)
    } catch (error) {
      console.error("Error generating receipt:", error)
    }
  }

  const handleSendReminder = async (fee: Fee) => {
    try {
      const studentName = `${fee.users?.first_name} ${fee.users?.last_name}`
      await sendPaymentReminder(
        "student@example.com", // En producción obtener del estudiante
        studentName,
        fee.amount,
        fee.due_date,
      )
      alert("Recordatorio enviado exitosamente")
    } catch (error) {
      console.error("Error sending reminder:", error)
    }
  }

  const generateMonthlyFees = async () => {
    const currentDate = new Date()
    const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

    try {
      const activeusers = users.filter((s) => s.status === "active")

      for (const student of activeusers) {
        await createFee({
          student_id: student.id,
          amount: 15000, // Monto base
          due_date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-15`,
          month_year: monthYear,
          status: "pending",
        })
      }

      await loadData()
      alert(`Se generaron ${activeusers.length} cuotas para ${monthYear}`)
    } catch (error) {
      console.error("Error generating monthly fees:", error)
    }
  }

  const filteredFees = fees.filter((fee) => {
    if (selectedStatus === "all") return true
    return fee.status === selectedStatus
  })

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

  const totalPending = fees.filter((f) => f.status === "pending").reduce((sum, f) => sum + f.amount, 0)
  const totalPaid = fees.filter((f) => f.status === "paid").reduce((sum, f) => sum + f.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Pagos</h2>
        <div className="flex space-x-2">
          <Button onClick={generateMonthlyFees} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Generar Cuotas Mensuales
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <DollarSign className="h-4 w-4 mr-2" />
                Nueva Cuota
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Cuota</DialogTitle>
                <DialogDescription>Crea una cuota individual para un estudiante</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateFee} className="space-y-4">
                <div>
                  <Label htmlFor="student_id">Estudiante</Label>
                  <Select
                    value={formData.student_id}
                    onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estudiante" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} - {student.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="15000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Fecha de Vencimiento</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="month_year">Mes/Año</Label>
                  <Input
                    id="month_year"
                    value={formData.month_year}
                    onChange={(e) => setFormData({ ...formData, month_year: e.target.value })}
                    placeholder="2024-02"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creando..." : "Crear Cuota"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {fees.filter((f) => f.status === "pending").length} cuotas pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {fees.filter((f) => f.status === "paid").length} cuotas pagadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cobro</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fees.length > 0 ? Math.round((fees.filter((f) => f.status === "paid").length / fees.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Pagos completados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="paid">Pagados</SelectItem>
                  <SelectItem value="overdue">Vencidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de cuotas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cuotas ({filteredFees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Mes/Año</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {fee.users?.first_name} {fee.users?.last_name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{fee.month_year}</TableCell>
                  <TableCell className="font-bold">${fee.amount.toLocaleString()}</TableCell>
                  <TableCell>{fee.due_date}</TableCell>
                  <TableCell>{getStatusBadge(fee.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {fee.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsPaid(fee.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleSendReminder(fee)}>
                            <Mail className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {fee.status === "paid" && (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadReceipt(fee)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
