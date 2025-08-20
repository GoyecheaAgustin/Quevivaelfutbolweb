"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Users, Edit, Trash, Search, Save, XCircle } from "lucide-react"
import { getUsers, updateUser, deleteUser } from "@/lib/database"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface UserProfile {
  id: string
  auth_id: string
  email: string
  role: string
  status: string
  first_name: string | null
  last_name: string | null
  dob: string | null // Date of Birth
  phone: string | null
  parent_name: string | null
  parent_phone: string | null
  parent_email: string | null
  address: string | null
  category: string | null
  notes: string | null
  profile_completed: boolean
  created_at: string
  updated_at: string
}

export default function StudentManagement() {
  const [students, setStudents] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const allUsers = await getUsers()
      // Filtrar solo estudiantes para esta gestión
      const studentProfiles = allUsers.filter((user: any) => user.role === "student")
      setStudents(studentProfiles)
    } catch (err: any) {
      console.error("Error loading students:", err)
      setError(err.message || "Error al cargar la lista de estudiantes.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    if (!editingStudent) return

    try {
      const updatedData = {
        first_name: editingStudent.first_name,
        last_name: editingStudent.last_name,
        dob: editingStudent.dob,
        phone: editingStudent.phone,
        parent_name: editingStudent.parent_name,
        parent_phone: editingStudent.parent_phone,
        parent_email: editingStudent.parent_email,
        address: editingStudent.address,
        category: editingStudent.category,
        notes: editingStudent.notes,
        status: editingStudent.status, // Permitir actualizar el estado
        profile_completed: editingStudent.profile_completed, // Mantener o actualizar
      }
      await updateUser(editingStudent.id, updatedData)
      setSuccess("Estudiante actualizado exitosamente.")
      setEditingStudent(null) // Cerrar el formulario de edición
      await loadStudents() // Recargar la lista
    } catch (err: any) {
      console.error("Error updating student:", err)
      setError(err.message || "Error al actualizar el estudiante.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este estudiante? Esta acción es irreversible.")) return

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await deleteUser(id)
      setSuccess("Estudiante eliminado exitosamente.")
      await loadStudents()
    } catch (err: any) {
      console.error("Error deleting student:", err)
      setError(err.message || "Error al eliminar el estudiante.")
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (student: UserProfile) => {
    setEditingStudent({ ...student }) // Crear una copia para editar
    setError(null)
    setSuccess(null)
  }

  const cancelEditing = () => {
    setEditingStudent(null)
    setError(null)
    setSuccess(null)
  }

  const filteredStudents = students.filter(
    (student) =>
      student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      "" ||
      student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      "" ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      "" ||
      student.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      "",
  )

  const calculateCategory = (dob: string | null) => {
    if (!dob) return ""
    const birthDate = new Date(dob)
    const currentYear = new Date().getFullYear()
    const birthYear = birthDate.getFullYear()
    return `${birthYear}-${birthYear + 1}`
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6" /> Gestión de Estudiantes
        </CardTitle>
        <CardDescription>Administra los perfiles de los estudiantes registrados.</CardDescription>
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

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Label htmlFor="searchStudent">Buscar Estudiante</Label>
            <div className="relative">
              <Input
                id="searchStudent"
                type="text"
                placeholder="Nombre, apellido, email o categoría"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-4 text-lg text-blue-800">Cargando estudiantes...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.category}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "active" ? "default" : "secondary"}>{student.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => startEditing(student)} disabled={saving}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id)}
                        disabled={saving}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No se encontraron estudiantes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {editingStudent && (
          <Card className="mt-8 p-4 border rounded-lg shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">
                Editar Estudiante: {editingStudent.first_name} {editingStudent.last_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_first_name">Nombre(s)</Label>
                    <Input
                      id="edit_first_name"
                      value={editingStudent.first_name || ""}
                      onChange={(e) =>
                        setEditingStudent((prev) => (prev ? { ...prev, first_name: e.target.value } : null))
                      }
                      required
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_last_name">Apellido(s)</Label>
                    <Input
                      id="edit_last_name"
                      value={editingStudent.last_name || ""}
                      onChange={(e) =>
                        setEditingStudent((prev) => (prev ? { ...prev, last_name: e.target.value } : null))
                      }
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_dob">Fecha de Nacimiento</Label>
                    <Input
                      id="edit_dob"
                      type="date"
                      value={editingStudent.dob || ""}
                      onChange={(e) => {
                        setEditingStudent((prev) =>
                          prev ? { ...prev, dob: e.target.value, category: calculateCategory(e.target.value) } : null,
                        )
                      }}
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_phone">Teléfono del Estudiante</Label>
                    <Input
                      id="edit_phone"
                      type="tel"
                      value={editingStudent.phone || ""}
                      onChange={(e) => setEditingStudent((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_address">Dirección</Label>
                  <Input
                    id="edit_address"
                    value={editingStudent.address || ""}
                    onChange={(e) => setEditingStudent((prev) => (prev ? { ...prev, address: e.target.value } : null))}
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_parent_name">Nombre del Padre/Tutor</Label>
                    <Input
                      id="edit_parent_name"
                      value={editingStudent.parent_name || ""}
                      onChange={(e) =>
                        setEditingStudent((prev) => (prev ? { ...prev, parent_name: e.target.value } : null))
                      }
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_parent_phone">Teléfono del Padre/Tutor</Label>
                    <Input
                      id="edit_parent_phone"
                      type="tel"
                      value={editingStudent.parent_phone || ""}
                      onChange={(e) =>
                        setEditingStudent((prev) => (prev ? { ...prev, parent_phone: e.target.value } : null))
                      }
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_parent_email">Email del Padre/Tutor</Label>
                  <Input
                    id="edit_parent_email"
                    type="email"
                    value={editingStudent.parent_email || ""}
                    onChange={(e) =>
                      setEditingStudent((prev) => (prev ? { ...prev, parent_email: e.target.value } : null))
                    }
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_category">Categoría</Label>
                  <Input
                    id="edit_category"
                    value={editingStudent.category || ""}
                    readOnly
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_status">Estado del Estudiante</Label>
                  <Select
                    value={editingStudent.status}
                    onValueChange={(value) => setEditingStudent((prev) => (prev ? { ...prev, status: value } : null))}
                    disabled={saving}
                  >
                    <SelectTrigger id="edit_status">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="moroso">Moroso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_notes">Notas Adicionales</Label>
                  <Textarea
                    id="edit_notes"
                    value={editingStudent.notes || ""}
                    onChange={(e) => setEditingStudent((prev) => (prev ? { ...prev, notes: e.target.value } : null))}
                    disabled={saving}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEditing} disabled={saving}>
                    <XCircle className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
