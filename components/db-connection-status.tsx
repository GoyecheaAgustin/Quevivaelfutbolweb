"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface DatabaseStatus {
  success: boolean
  message?: string
  error?: string
  details?: string
  data?: {
    connection: string
    tables: {
      users: {
        accessible: boolean
        count: number
        error: string | null
      }
      students: {
        accessible: boolean
        count: number
        error: string | null
      }
    }
    timestamp: string
  }
}

export function DatabaseConnectionStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()
      setStatus(data)
    } catch (error: any) {
      setStatus({
        success: false,
        error: "Error al conectar con la API",
        details: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Estado de la Base de Datos
        </CardTitle>
        <CardDescription>Verificación de conectividad y estructura de Supabase</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status?.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className="font-medium">
              {loading ? "Verificando..." : status?.success ? "Conectado" : "Error de conexión"}
            </span>
          </div>

          <Button onClick={testConnection} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Verificar
          </Button>
        </div>

        {status && !loading && (
          <>
            {status.success ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {status.message || "Conexión exitosa a la base de datos"}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{status.error || "Error desconocido"}</p>
                    {status.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer">Ver detalles técnicos</summary>
                        <pre className="mt-2 p-2 bg-red-100 rounded text-red-800 overflow-auto">{status.details}</pre>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {status.data && (
              <div className="space-y-3">
                <h4 className="font-medium">Estado de las Tablas:</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Usuarios</span>
                      <Badge variant={status.data.tables.users.accessible ? "default" : "destructive"}>
                        {status.data.tables.users.accessible ? "OK" : "Error"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Registros: {status.data.tables.users.count || 0}</p>
                    {status.data.tables.users.error && (
                      <p className="text-xs text-red-600 mt-1">{status.data.tables.users.error}</p>
                    )}
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Estudiantes</span>
                      <Badge variant={status.data.tables.students.accessible ? "default" : "destructive"}>
                        {status.data.tables.students.accessible ? "OK" : "Error"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Registros: {status.data.tables.students.count || 0}</p>
                    {status.data.tables.students.error && (
                      <p className="text-xs text-red-600 mt-1">{status.data.tables.students.error}</p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Última verificación: {new Date(status.data.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
