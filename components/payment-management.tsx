"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, DollarSign, Edit, Trash, FileText, Mail, Save, XCircle } from "lucide-react"
import { getFees, createFee, updateFee, deleteFee, getUsers } from "@/lib/database"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendPaymentReminder } from "@/lib/notifications"
import { generatePaymentReceipt, downloadPdf } from "@/lib/pdf-generator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Fee {
  id: string
  student_id: string
  amount: number
  currency: string
  due_date: string
  payment_date: string | null
  status: string
  period: string
  notes: string | null
  receipt_url: string | null
  users?: { first_name: string; last_name: string; email: string } // Para el JOIN
}

interface Student {
  id: string
  first_name: string
  last_name: string
  email: string
}

export default function PaymentManagement() {
  const [fees, setFees] = useState<Fee[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingFee, setEditingFee] = useState<Fee | null>(null)
  const [newFeeData, setNewFeeData] = useState({
    student_id: "",
    amount: "",
    due_date: "",
    period: "",
    status: "pending",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const allFees = await getFees()
      setFees(allFees || [])

      const allUsers = await getUsers()
      const studentUsers = allUsers.filter((u: any) => u.role === "student")
      setStudents(studentUsers)
    } catch (err: any) {
      console.error("Error loading payment data:", err)
      setError(err.message || "Error al cargar los datos de pagos.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const parsedAmount = Number.parseFloat(newFeeData.amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Por favor, ingresa un monto válido.")
      setSaving(false)
      return
    }

    try {
      const feeToSave = {
        student_id: newFeeData.student_id,
        amount: parsedAmount,
        currency: "USD", // Moneda por defecto
        due_date: newFeeData.due_date,
        period: newFeeData.period,
        status: newFeeData.status,
        payment_date: newFeeData.status === "paid" ? new Date().toISOString().split("T")[0] : null,
      }

      if (editingFee) {
        await updateFee(editingFee.id, feeToSave)
        setSuccess("Cuota actualizada exitosamente.")
      } else {
        await createFee(feeToSave)
        setSuccess("Cuota creada exitosamente.")
      }
      resetForm()
      await loadData()
    } catch (err: any) {
      console.error("Error saving fee:", err)
      setError(err.message || "Error al guardar la cuota.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteFee = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta cuota?")) return

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await deleteFee(id)
      setSuccess("Cuota eliminada exitosamente.")
      await loadData()
    } catch (err: any) {
      console.error("Error deleting fee:", err)
      setError(err.message || "Error al eliminar la cuota.")
    } finally {
      setSaving(false)
    }
  }

  const handleSendReminder = async (fee: Fee) => {
    setSaving(true) // Usar saving para indicar que se está enviando
    setError(null)
    setSuccess(null)
    try {
      const student = students.find((s) => s.id === fee.student_id)
      if (!student || !student.email) {
        setError("No se encontró el email del estudiante para enviar el recordatorio.")
        setSaving(false)
        return
      }
      await sendPaymentReminder(
        `${student.first_name} ${student.last_name}`,
        student.email,
        fee.amount,
        new Date(fee.due_date).toLocaleDateString(),
      )
      setSuccess(`Recordatorio enviado a ${student.first_name} ${student.last_name}.`)
    } catch (err: any) {
      console.error("Error sending reminder:", err)
      setError(err.message || "Error al enviar el recordatorio.")
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadReceipt = async (fee: Fee) => {
    if (!fee.payment_date || fee.status !== "paid") {
      setError("Solo se pueden descargar recibos de cuotas pagadas.")
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const student = students.find((s) => s.id === fee.student_id)
      if (!student) {
        setError("No se encontró el estudiante para generar el recibo.")
        setSaving(false)
        return
      }

      const receiptData = {
        receiptId: fee.id.substring(0, 8),
        studentName: `${student.first_name} ${student.last_name}`,
        studentId: student.id,
        amount: fee.amount,
        currency: fee.currency,
        paymentDate: new Date(fee.payment_date).toLocaleDateString(),
        dueDate: new Date(fee.due_date).toLocaleDateString(),
        period: fee.period,
        status: "Pagado",
        notes: fee.notes || "",
        schoolName: "Que Viva El Fútbol",
        schoolAddress: "Calle Falsa 123, Ciudad",
        schoolPhone: "+123456789",
        schoolEmail: "info@quevivaelfutbol.com",
      }
      const receiptBlob = await generatePaymentReceipt(receiptData)
      await downloadPdf(receiptBlob, `recibo-${receiptData.receiptId}.pdf`)
      setSuccess("Recibo descargado exitosamente.")
    } catch (err: any) {
      console.error("Error downloading receipt:", err)
      setError(err.message || "Error al descargar el recibo.")
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (fee: Fee) => {
    setEditingFee(fee)
    setNewFeeData({
      student_id: fee.student_id,
      amount: fee.amount.toString(),
      due_date: fee.due_date,
      period: fee.period,
      status: fee.status,
    })
    setError(null)
    setSuccess(null)
  }

  const resetForm = () => {
    setEditingFee(null)
    setNewFeeData({
      student_id: "",
      amount: "",
      due_date: "",
      period: "",
      status: "pending",
    })
    setError(null)
    setSuccess(null)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" /> Gestión de Pagos
        </CardTitle>
        <CardDescription>
          Administra las cuotas de los estudiantes, envía recordatorios y genera recibos.
        </CardDescription>
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

        <form onSubmit={handleCreateOrUpdateFee} className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">{editingFee ? "Editar Cuota" : "Crear Nueva Cuota"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student_id">Estudiante</Label>
              <Select
                value={newFeeData.student_id}
                onValueChange={(value) => setNewFeeData((prev) => ({ ...prev, student_id: value }))}
                disabled={saving || !!editingFee} // No permitir cambiar estudiante al editar
              >
                <SelectTrigger id="student_id">
                  <SelectValue placeholder="Selecciona un estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={newFeeData.amount}
                onChange={(e) => setNewFeeData((prev) => ({ ...prev, amount: e.target.value }))}
                required
                disabled={saving}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Fecha de Vencimiento</Label>
              <Input
                id="due_date"
                type="date"
                value={newFeeData.due_date}
                onChange={(e) => setNewFeeData((prev) => ({ ...prev, due_date: e.target.value }))}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Input
                id="period"
                value={newFeeData.period}
                onChange={(e) => setNewFeeData((prev) => ({ ...prev, period: e.target.value }))}
                placeholder="Ej: Julio 2024"
                required
                disabled={saving}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={newFeeData.status}
              onValueChange={(value) => setNewFeeData((prev) => ({ ...prev, status: value }))}
              disabled={saving}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
                <SelectItem value="waived">Exonerado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> {editingFee ? "Actualizar Cuota" : "Crear Cuota"}
                </>
              )}
            </Button>
            {editingFee && (
              <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                <XCircle className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            )}
          </div>
        </form>

        <h3 className="text-lg font-semibold mt-8">Historial de Cuotas</h3>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-4 text-lg text-blue-800">Cargando cuotas...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.length > 0 ? (
                fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">
                      {fee.users ? `${fee.users.first_name} ${fee.users.last_name}` : "Desconocido"}
                    </TableCell>
                    <TableCell>
                      {fee.currency} {fee.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>{fee.period}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(fee.status)}>{fee.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => startEditing(fee)} disabled={saving}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteFee(fee.id)} disabled={saving}>
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                      {fee.status === "pending" && (
                        <Button variant="ghost" size="sm" onClick={() => handleSendReminder(fee)} disabled={saving}>
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      {fee.status === "paid" && (
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadReceipt(fee)} disabled={saving}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No hay cuotas registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
