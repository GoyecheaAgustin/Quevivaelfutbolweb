"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function CompletarPerfil() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    address: "",
    category: "",
    notes: "",
    role: "student"
  })

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/login")
      }
    }
    checkSession()
  }, [router])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const {
      data: { user },
      error: sessionError
    } = await supabase.auth.getUser()

    if (sessionError || !user) {
      setError("No se pudo obtener el usuario autenticado.")
      setLoading(false)
      return
    }

    const { error: upsertError } = await supabase.from("users").upsert(
      {
        auth_id: user.id,
        email: user.email,
        status: "moroso", // 👈 opcional, si querés que arranque así
        completo: true,   // 👈 lo usamos para saber si ya completó
        ...formData
      },
      { onConflict: "auth_id" } // 👈 evita duplicados
    )

    if (upsertError) {
      setError("Error al guardar los datos: " + upsertError.message)
    } else {
      router.push("/dashboard")
    }

    setLoading(false)
  }


  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Completar perfil</CardTitle>
          <CardDescription>Ingresá toda la información para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Nombre</Label><Input name="first_name" value={formData.first_name} onChange={handleChange} required /></div>
            <div><Label>Apellido</Label><Input name="last_name" value={formData.last_name} onChange={handleChange} required /></div>
            <div><Label>Fecha de nacimiento</Label><Input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required /></div>
            <div><Label>Teléfono</Label><Input name="phone" value={formData.phone} onChange={handleChange} /></div>
            <div><Label>Nombre del padre/madre</Label><Input name="parent_name" value={formData.parent_name} onChange={handleChange} /></div>
            <div><Label>Teléfono del padre/madre</Label><Input name="parent_phone" value={formData.parent_phone} onChange={handleChange} /></div>
            <div><Label>Email del padre/madre</Label><Input type="email" name="parent_email" value={formData.parent_email} onChange={handleChange} /></div>
            <div><Label>Dirección</Label><Input name="address" value={formData.address} onChange={handleChange} /></div>
            <div><Label>Categoría</Label><Input name="category" value={formData.category} onChange={handleChange} /></div>
            <div className="md:col-span-2"><Label>Notas</Label><Textarea name="notes" value={formData.notes} onChange={handleChange} /></div>
            <div><Label>Rol</Label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full border px-3 py-2 rounded-md">
                <option value="student">Estudiante</option>
              </select>
            </div>
            <div className="md:col-span-2">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Guardar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
