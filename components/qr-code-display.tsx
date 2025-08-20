"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Share2, RefreshCw } from "lucide-react"
import { generateQRCode, downloadQRCode, shareQRCode } from "@/lib/qr-generator"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface QRCodeDisplayProps {
  data: string // Los datos a codificar en el QR (ej. ID de estudiante, URL de perfil)
  title?: string
  description?: string
  filename?: string
}

export default function QRCodeDisplay({ data, title, description, filename = "qr_code.png" }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const generateAndSetQr = async () => {
    setLoading(true)
    setError(null)
    setQrCodeUrl(null)
    try {
      const url = await generateQRCode(data)
      setQrCodeUrl(url)
    } catch (err: any) {
      console.error("Failed to generate QR code:", err)
      setError(err.message || "Error al generar el código QR.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (data) {
      generateAndSetQr()
    } else {
      setLoading(false)
      setError("No hay datos para generar el código QR.")
    }
  }, [data])

  const handleDownload = async () => {
    if (qrCodeUrl) {
      try {
        await downloadQRCode(qrCodeUrl, filename)
      } catch (err: any) {
        setError(err.message || "Error al descargar el código QR.")
      }
    }
  }

  const handleShare = async () => {
    if (qrCodeUrl) {
      try {
        await shareQRCode(qrCodeUrl, `Escanea este código QR para ${title || "ver información"}.`)
      } catch (err: any) {
        setError(err.message || "Error al compartir el código QR.")
      }
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{title || "Código QR"}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center h-48 w-48 bg-gray-100 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Generando QR...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="w-full mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {qrCodeUrl && !loading && !error && (
          <div className="relative w-48 h-48 mb-4">
            <img
              src={qrCodeUrl || "/placeholder.svg"}
              alt={title || "Código QR"}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          <Button onClick={handleDownload} disabled={!qrCodeUrl || loading} className="w-full">
            <Download className="mr-2 h-4 w-4" /> Descargar QR
          </Button>
          <Button
            onClick={handleShare}
            disabled={!qrCodeUrl || loading}
            className="w-full bg-transparent"
            variant="outline"
          >
            <Share2 className="mr-2 h-4 w-4" /> Compartir QR
          </Button>
          <Button onClick={generateAndSetQr} disabled={loading} className="w-full" variant="ghost">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Regenerar QR
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
