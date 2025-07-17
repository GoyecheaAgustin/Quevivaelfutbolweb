"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Database } from "lucide-react"

export function DbConnectionStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verificando conexión a la base de datos...")
  const [details, setDetails] = useState<string | null>(null)

  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch("/api/test-db")
        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage(data.message || "Conexión a la base de datos exitosa.")
          setDetails(data.data ? `Email de prueba: ${data.data.email}` : null)
        } else {
          setStatus("error")
          setMessage(data.message || "Error al conectar a la base de datos.")
          setDetails(data.details || "Detalles desconocidos.")
        }
      } catch (e: any) {
        setStatus("error")
        setMessage("No se pudo alcanzar la API de prueba de conexión.")
        setDetails(e.message || "Error de red o servidor.")
      }
    }

    checkConnection()
  }, [])

  return (
    <Alert
      className={`flex items-center space-x-3 ${
        status === "success"
          ? "border-green-500 bg-green-50 text-green-800"
          : status === "error"
            ? "border-red-500 bg-red-50 text-red-800"
            : "border-blue-500 bg-blue-50 text-blue-800"
      }`}
    >
      {status === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
      {status === "success" && <CheckCircle className="h-5 w-5" />}
      {status === "error" && <XCircle className="h-5 w-5" />}
      <div>
        <AlertTitle className="flex items-center">
          <Database className="h-4 w-4 mr-2" />
          Estado de la Base de Datos
        </AlertTitle>
        <AlertDescription>
          <p>{message}</p>
          {details && <p className="text-sm opacity-80 mt-1">{details}</p>}
        </AlertDescription>
      </div>
    </Alert>
  )
}
