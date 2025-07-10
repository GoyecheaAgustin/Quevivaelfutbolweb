"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CreditCard, Upload, QrCode } from "lucide-react"

interface PaymentInterfaceProps {
  fee: {
    id: string
    month: string
    amount: number
    dueDate: string
    status: string
  }
  onPaymentComplete: () => void
}

export default function PaymentInterface({ fee, onPaymentComplete }: PaymentInterfaceProps) {
  const [paymentMethod, setPaymentMethod] = useState("")
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleMercadoPagoPayment = async () => {
    setLoading(true)
    try {
      // Simulación de integración con MercadoPago
      console.log("Iniciando pago con MercadoPago:", fee)

      // En producción, aquí harías la llamada a la API de MercadoPago
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert("Pago procesado exitosamente con MercadoPago")
      onPaymentComplete()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("Error al procesar el pago")
    } finally {
      setLoading(false)
    }
  }

  const handleBankTransfer = () => {
    // Mostrar datos bancarios
    alert(`
      Datos para transferencia bancaria:
      
      Banco: Banco Ejemplo
      Cuenta: 1234567890
      CBU: 0123456789012345678901
      Titular: Escuela de Fútbol
      Monto: $${fee.amount.toLocaleString()}
      
      Referencia: ${fee.id}
    `)
  }

  const generateQRPayment = () => {
    // Generar QR para pago
    const qrData = {
      amount: fee.amount,
      reference: fee.id,
      description: `Cuota ${fee.month}`,
    }

    alert(`QR generado para pago de $${fee.amount.toLocaleString()}`)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <CreditCard className="h-4 w-4 mr-2" />
          Pagar Cuota
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pagar Cuota</DialogTitle>
          <DialogDescription>
            Cuota de {fee.month} - ${fee.amount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Método de Pago</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mercadopago">MercadoPago</SelectItem>
                <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                <SelectItem value="qr">Código QR</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "mercadopago" && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Serás redirigido a MercadoPago para completar el pago de forma segura.
                </p>
                <Button
                  onClick={handleMercadoPagoPayment}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Procesando..." : "Pagar con MercadoPago"}
                </Button>
              </CardContent>
            </Card>
          )}

          {paymentMethod === "transfer" && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-4">Realiza la transferencia y luego sube el comprobante.</p>
                <div className="space-y-2">
                  <Button onClick={handleBankTransfer} variant="outline" className="w-full bg-transparent">
                    Ver Datos Bancarios
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Comprobante
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === "qr" && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-4">Escanea el código QR con tu app de banco.</p>
                <Button onClick={generateQRPayment} variant="outline" className="w-full bg-transparent">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generar QR de Pago
                </Button>
              </CardContent>
            </Card>
          )}

          {paymentMethod === "cash" && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-4">Acércate a la escuela para realizar el pago en efectivo.</p>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Horarios de atención:</strong>
                    <br />
                    Lunes a Viernes: 16:00 - 20:00
                    <br />
                    Sábados: 9:00 - 13:00
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
