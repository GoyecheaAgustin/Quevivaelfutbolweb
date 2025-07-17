"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, X, Eye, Clock } from "lucide-react"
import { getFees, updateFee } from "@/lib/database"
import { getCurrentUser } from "@/lib/auth"

interface PendingPayment {
  id: string
  student_name: string
  month_year: string
  amount: number
  payment_proof_url?: string
  payment_proof_filename?: string
  created_at: string
  students?: { first_name: string; last_name: string }
}

export default function PaymentApproval() {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [user, fees] = await Promise.all([getCurrentUser(), getFees()])

      setCurrentUser(user)

      // Filtrar solo pagos pendientes de aprobación
      const pending = fees?.filter((f) => f.status === "pending_approval") || []
      setPendingPayments(pending)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (paymentId: string) => {
    if (!currentUser) return

    setProcessing(true)
    try {
      await updateFee(paymentId, {
        status: "paid",
        approved_by: currentUser.id,
        approved_at: new Date().toISOString(),
        payment_date: new Date().toISOString(),
      })

      await loadData()
      alert("Pago aprobado exitosamente")
    } catch (error) {
      console.error("Error approving payment:", error)
      alert("Error al aprobar el pago")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (paymentId: string) => {
    if (!currentUser || !rejectionReason.trim()) {
      alert("Debes proporcionar una razón para rechazar el pago")
      return
    }

    setProcessing(true)
    try {
      await updateFee(paymentId, {
        status: "rejected",
        approved_by: currentUser.id,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      })

      await loadData()
      setRejectionReason("")
      setSelectedPayment(null)
      alert("Pago rechazado")
    } catch (error) {
      console.error("Error rejecting payment:", error)
      alert("Error al rechazar el pago")
    } finally {
      setProcessing(false)
    }
  }

  const viewProof = (payment: PendingPayment) => {
    if (payment.payment_proof_url) {
      window.open(payment.payment_proof_url, "_blank")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Aprobación de Pagos</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          <Clock className="h-4 w-4 mr-2" />
          {pendingPayments.length} pendientes
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagos Pendientes de Aprobación</CardTitle>
          <CardDescription>Revisa y aprueba los comprobantes de pago subidos por los estudiantes</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Mes/Año</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Comprobante</TableHead>
                  <TableHead>Fecha Subida</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.students?.first_name} {payment.students?.last_name}
                    </TableCell>
                    <TableCell>{payment.month_year}</TableCell>
                    <TableCell className="font-bold">${payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {payment.payment_proof_filename ? (
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-green-50">
                            Subido
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => viewProof(payment)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50">
                          Sin comprobante
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(payment.id)}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPayment(payment)}
                              className="bg-red-50 hover:bg-red-100"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rechazar Pago</DialogTitle>
                              <DialogDescription>Proporciona una razón para rechazar este pago</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reason">Razón del rechazo</Label>
                                <Textarea
                                  id="reason"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Ej: El comprobante no es legible, monto incorrecto, etc."
                                  rows={3}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={() => selectedPayment && handleReject(selectedPayment.id)}
                                  disabled={processing || !rejectionReason.trim()}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Rechazar Pago
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay pagos pendientes de aprobación</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
