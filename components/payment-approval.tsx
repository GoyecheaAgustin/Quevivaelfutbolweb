"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, DollarSign, FileText } from "lucide-react"
import { getFees, updateFee } from "@/lib/database"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendPaymentConfirmation } from "@/lib/notifications"
import { generatePaymentReceipt, downloadPdf } from "@/lib/pdf-generator"

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
  users?: { first_name: string; last_name: string; email: string } // Asumiendo que el JOIN trae estos datos
}

export default function PaymentApproval() {
  const [pendingFees, setPendingFees] = useState<Fee[]>([])
  const [loading, setLoading] = useState(true)
  const [processingFeeId, setProcessingFeeId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadPendingFees()
  }, [])

  const loadPendingFees = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const allFees = await getFees()
      const filteredPendingFees = allFees?.filter((fee: Fee) => fee.status === "pending") || []
      setPendingFees(filteredPendingFees)
    } catch (err: any) {
      console.error("Error loading pending fees:", err)
      setError(err.message || "Error al cargar las cuotas pendientes.")
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePayment = async (fee: Fee) => {
    setProcessingFeeId(fee.id)
    setError(null)
    setSuccess(null)
    try {
      const updatedFee = await updateFee(fee.id, {
        status: "paid",
        payment_date: new Date().toISOString().split("T")[0],
      })

      // Generar y subir recibo (simulado o real)
      const receiptData = {
        receiptId: updatedFee.id.substring(0, 8), // Usar parte del ID como ID de recibo
        studentName: `${fee.users?.first_name} ${fee.users?.last_name}`,
        studentId: fee.student_id,
        amount: fee.amount,
        currency: fee.currency,
        paymentDate: updatedFee.payment_date || new Date().toISOString().split("T")[0],
        dueDate: fee.due_date,
        period: fee.period,
        status: "Pagado",
        notes: fee.notes || "",
        schoolName: "Que Viva El Fútbol",
        schoolAddress: "Calle Falsa 123, Ciudad",
        schoolPhone: "+123456789",
        schoolEmail: "info@quevivaelfutbol.com",
      }
      const receiptBlob = await generatePaymentReceipt(receiptData)
      // Aquí podrías subir el blob a Supabase Storage y obtener una URL
      // Por ahora, solo simulamos la URL
      const receiptUrl = `https://example.com/receipts/${updatedFee.id}.pdf`

      await updateFee(updatedFee.id, { receipt_url: receiptUrl })

      // Enviar confirmación por email
      if (fee.users?.email) {
        await sendPaymentConfirmation(
          `${fee.users.first_name} ${fee.users.last_name}`,
          fee.users.email,
          fee.amount,
          receiptData.receiptId,
        )
      }

      setSuccess(`Pago de ${fee.users?.first_name} ${fee.users?.last_name} aprobado y confirmado.`)
      await loadPendingFees() // Recargar la lista
    } catch (err: any) {
      console.error("Error approving payment:", err)
      setError(err.message || "Error al aprobar el pago.")
    } finally {
      setProcessingFeeId(null)
    }
  }

  const handleRejectPayment = async (feeId: string) => {
    setProcessingFeeId(feeId)
    setError(null)
    setSuccess(null)
    try {
      await updateFee(feeId, { status: "rejected", payment_date: null })
      setSuccess("Pago rechazado.")
      await loadPendingFees()
    } catch (err: any) {
      console.error("Error rejecting payment:", err)
      setError(err.message || "Error al rechazar el pago.")
    } finally {
      setProcessingFeeId(null)
    }
  }

  const handleDownloadReceipt = async (fee: Fee) => {
    if (!fee.receipt_url) {
      setError("No hay URL de recibo disponible para descargar.")
      return
    }
    try {
      // En un entorno real, aquí harías un fetch a la URL del recibo
      // Para esta simulación, regeneramos el PDF para la descarga
      const receiptData = {
        receiptId: fee.id.substring(0, 8),
        studentName: `${fee.users?.first_name} ${fee.users?.last_name}`,
        studentId: fee.student_id,
        amount: fee.amount,
        currency: fee.currency,
        paymentDate: fee.payment_date || new Date().toISOString().split("T")[0],
        dueDate: fee.due_date,
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
    }
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" /> Aprobación de Pagos
        </CardTitle>
        <CardDescription>Revisa y aprueba los pagos pendientes de los estudiantes.</CardDescription>
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

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-4 text-lg text-blue-800">Cargando pagos pendientes...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingFees.length > 0 ? (
                pendingFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">
                      {fee.users ? `${fee.users.first_name} ${fee.users.last_name}` : "Estudiante Desconocido"}
                    </TableCell>
                    <TableCell>
                      {fee.currency} {fee.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{fee.period}</TableCell>
                    <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{fee.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprovePayment(fee)}
                        disabled={processingFeeId === fee.id}
                        className="text-green-600 hover:text-green-800"
                      >
                        {processingFeeId === fee.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRejectPayment(fee.id)}
                        disabled={processingFeeId === fee.id}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      {fee.status === "paid" && fee.receipt_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(fee)}
                          disabled={processingFeeId === fee.id}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No hay pagos pendientes de aprobación.
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
