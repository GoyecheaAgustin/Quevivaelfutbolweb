"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Edit, Trash, Newspaper, Save, XCircle } from "lucide-react"
import { getNews, createNews, updateNews, deleteNews } from "@/lib/database"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCurrentUser } from "@/lib/auth"

interface NewsItem {
  id: string
  title: string
  content: string
  author_id: string
  published_at: string
  created_at: string
  updated_at: string
  users?: { email: string; first_name: string; last_name: string } // Para el JOIN
}

export default function NewsManagement() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [newNewsData, setNewNewsData] = useState({ title: "", content: "" })
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    loadNews()
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (err) {
      console.error("Error loading current user:", err)
      setError("No se pudo cargar la información del usuario actual.")
    }
  }

  const loadNews = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await getNews()
      setNews(data || [])
    } catch (err: any) {
      console.error("Error loading news:", err)
      setError(err.message || "Error al cargar las noticias.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrUpdateNews = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    if (!currentUser?.id) {
      setError("No se pudo identificar al autor de la noticia. Por favor, recarga la página.")
      setSaving(false)
      return
    }

    try {
      if (editingNews) {
        // Actualizar noticia existente
        await updateNews(editingNews.id, {
          title: newNewsData.title,
          content: newNewsData.content,
        })
        setSuccess("Noticia actualizada exitosamente.")
      } else {
        // Crear nueva noticia
        await createNews({
          title: newNewsData.title,
          content: newNewsData.content,
          author_id: currentUser.id, // Usar el ID del usuario autenticado como autor
        })
        setSuccess("Noticia creada exitosamente.")
      }
      setNewNewsData({ title: "", content: "" })
      setEditingNews(null)
      await loadNews() // Recargar la lista de noticias
    } catch (err: any) {
      console.error("Error saving news:", err)
      setError(err.message || "Error al guardar la noticia.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNews = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta noticia?")) return

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await deleteNews(id)
      setSuccess("Noticia eliminada exitosamente.")
      await loadNews()
    } catch (err: any) {
      console.error("Error deleting news:", err)
      setError(err.message || "Error al eliminar la noticia.")
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (newsItem: NewsItem) => {
    setEditingNews(newsItem)
    setNewNewsData({ title: newsItem.title, content: newsItem.content })
    setError(null)
    setSuccess(null)
  }

  const cancelEditing = () => {
    setEditingNews(null)
    setNewNewsData({ title: "", content: "" })
    setError(null)
    setSuccess(null)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-6 w-6" /> Gestión de Noticias
        </CardTitle>
        <CardDescription>Crea, edita y elimina anuncios y noticias para la comunidad.</CardDescription>
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

        <form onSubmit={handleCreateOrUpdateNews} className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">{editingNews ? "Editar Noticia" : "Crear Nueva Noticia"}</h3>
          <div className="space-y-2">
            <Label htmlFor="newsTitle">Título</Label>
            <Input
              id="newsTitle"
              value={newNewsData.title}
              onChange={(e) => setNewNewsData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Título de la noticia"
              required
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newsContent">Contenido</Label>
            <Textarea
              id="newsContent"
              value={newNewsData.content}
              onChange={(e) => setNewNewsData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Contenido completo de la noticia..."
              required
              disabled={saving}
              rows={5}
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
                  <Save className="mr-2 h-4 w-4" /> {editingNews ? "Actualizar Noticia" : "Publicar Noticia"}
                </>
              )}
            </Button>
            {editingNews && (
              <Button type="button" variant="outline" onClick={cancelEditing} disabled={saving}>
                <XCircle className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            )}
          </div>
        </form>

        <h3 className="text-lg font-semibold mt-8">Noticias Publicadas</h3>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-4 text-lg text-blue-800">Cargando noticias...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.length > 0 ? (
                news.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      {item.users ? `${item.users.first_name} ${item.users.last_name}` : "Desconocido"}
                    </TableCell>
                    <TableCell>{new Date(item.published_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => startEditing(item)} disabled={saving}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteNews(item.id)} disabled={saving}>
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    No hay noticias publicadas.
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
