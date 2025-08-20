"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CreditCard, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createFee } from "@/lib/database" // Asumiendo que createFee puede simular un pago
import { sendPaymentConfirmation } from "@/lib/notifications"
import { generatePaymentReceipt, downloadPdf } from "@/lib/pdf-generator"

interface PaymentInterfaceProps {
  studentId: string // ID del estudiante que realiza el pago
  studentName: string
  studentEmail: string
  defaultAmount?: number
  defaultPeriod?: string
}

export default function PaymentInterface({
  studentId,
  studentName,
  studentEmail,
  defaultAmount,
  defaultPeriod,
}: PaymentInterfaceProps) {
  const [amount, setAmount] = useState<string>(defaultAmount?.toFixed(2) || "")
  const [period, setPeriod] = useState<string>(defaultPeriod || "")
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const parsedAmount = Number.parseFloat(amount)

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Por favor, ingresa un monto válido.")
      setLoading(false)
      return
    }
    if (!period) {
      setError("Por favor, selecciona el período de la cuota.")
      setLoading(false)
      return
    }
    if (!paymentMethod) {
      setError("Por favor, selecciona un método de pago.")
      setLoading(false)
      return
    }

    try {
      // Simular la creación de una cuota como "pagada" directamente
      // En un sistema real, esto interactuaría con una pasarela de pago (ej. Mercado Pago)
      const newFee = await createFee({
        student_id: studentId,
        amount: parsedAmount,
        currency: "USD", // O la moneda que uses
        due_date: new Date().toISOString().split("T")[0], // Fecha de vencimiento (puede ser la actual o futura)
        payment_date: new Date().toISOString().split("T")[0], // Fecha de pago
        status: "paid", // Marcar como pagado directamente
        period: period,
        notes: `Pago realizado vía ${paymentMethod}`,
      })

      // Generar recibo PDF
      const receiptData = {
        receiptId: newFee.id.substring(0, 8),
        studentName: studentName,
        studentId: studentId,
        amount: newFee.amount,
        currency: newFee.currency,
        paymentDate: newFee.payment_date,
        dueDate: newFee.due_date,
        period: newFee.period,
        status: "Pagado",
        notes: newFee.notes,
        schoolName: "Que Viva El Fútbol",
        schoolAddress: "Calle Falsa 123, Ciudad",
        schoolPhone: "+123456789",
        schoolEmail: "info@quevivaelfutbol.com",
      }
      const receiptBlob = await generatePaymentReceipt(receiptData)
      await downloadPdf(receiptBlob, `recibo-${receiptData.receiptId}.pdf`)

      // Enviar confirmación por email
      await sendPaymentConfirmation(studentName, studentEmail, parsedAmount, receiptData.receiptId)

      setSuccess("¡Pago realizado con éxito! Se ha descargado tu recibo y enviado una confirmación por email.")
      setAmount("")
      setPeriod("")
      setPaymentMethod("")
    } catch (err: any) {
      console.error("Error processing payment:", err)
      setError(err.message || "Error al procesar el pago. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-6 w-6" /> Realizar Pago
        </CardTitle>
        <CardDescription>Completa el formulario para pagar tu cuota.</CardDescription>
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

        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto a Pagar (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 50.00"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Período de la Cuota</Label>
            <Input
              id="period"
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Ej: Julio 2024"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pago</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={loading}>
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Selecciona un método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                <SelectItem value="debit_card">Tarjeta de Débito</SelectItem>
                <SelectItem value="mercado_pago">Mercado Pago</SelectItem>
                <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Confirmar Pago
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
