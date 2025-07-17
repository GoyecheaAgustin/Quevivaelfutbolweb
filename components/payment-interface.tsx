"use client"

import type React from "react"

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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CreditCard, Upload, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        alert("Solo se permiten archivos JPG, PNG o PDF")
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo no puede ser mayor a 5MB")
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUploadProof = async () => {
    if (!selectedFile) {
      alert("Debes seleccionar un archivo")
      return
    }

    setLoading(true)
    try {
      // Simular subida de archivo
      // En producción, aquí subirías el archivo a un servicio como Vercel Blob o AWS S3
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simular actualización del estado del pago
      console.log("Subiendo comprobante para:", fee.id)
      console.log("Archivo:", selectedFile.name)

      // Aquí actualizarías el estado del pago a 'pending_approval'
      // await updateFee(fee.id, {
      //   status: 'pending_approval',
      //   payment_proof_filename: selectedFile.name
      // })

      setUploadSuccess(true)
      setTimeout(() => {
        onPaymentComplete()
        setIsDialogOpen(false)
        setUploadSuccess(false)
        setSelectedFile(null)
      }, 2000)
    } catch (error) {
      console.error("Error uploading proof:", error)
      alert("Error al subir el comprobante")
    } finally {
      setLoading(false)
    }
  }

  const getBankInfo = () => {
    return {
      bank: "Banco Ejemplo",
      account: "1234567890",
      cbu: "0123456789012345678901",
      alias: "FUTBOL.BETO.ESCUELA",
      holder: "Escuela de Fútbol Profe Beto",
    }
  }

  const bankInfo = getBankInfo()

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

        <div className="space-y-6">
          {/* Información bancaria */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Datos para Transferencia</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Banco:</span>
                    <span className="font-medium">{bankInfo.bank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cuenta:</span>
                    <span className="font-medium">{bankInfo.account}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CBU:</span>
                    <span className="font-medium font-mono text-xs">{bankInfo.cbu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alias:</span>
                    <span className="font-medium">{bankInfo.alias}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Titular:</span>
                    <span className="font-medium">{bankInfo.holder}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 font-semibold">Monto:</span>
                    <span className="font-bold text-green-600">${fee.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subir comprobante */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold">Subir Comprobante</h3>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Después de realizar la transferencia, sube el comprobante para que sea aprobado por el administrador.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Label htmlFor="proof">Comprobante de Pago</Label>
              <Input
                id="proof"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
                disabled={loading}
              />
              {selectedFile && <p className="text-sm text-gray-600">Archivo seleccionado: {selectedFile.name}</p>}
            </div>

            {uploadSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  ¡Comprobante subido exitosamente! Tu pago está pendiente de aprobación.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleUploadProof}
              disabled={loading || !selectedFile || uploadSuccess}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {loading ? "Subiendo comprobante..." : uploadSuccess ? "¡Comprobante subido!" : "Subir Comprobante"}
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Formatos aceptados: JPG, PNG, PDF</p>
            <p>• Tamaño máximo: 5MB</p>
            <p>• El pago será aprobado en 24-48 horas</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
