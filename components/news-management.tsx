"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FileText, Edit, Trash2, Send, Plus } from "lucide-react"
import { getNews, createNews, updateNews, deleteNews } from "@/lib/database"
import { sendEmail } from "@/lib/notifications"

interface NewsItem {
  id: string
  title: string
  content: string
  published: boolean
  created_at: string
  users?: { email: string }
}

export default function NewsManagement() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    published: false,
  })

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      const data = await getNews()
      setNews(data || [])
    } catch (error) {
      console.error("Error loading news:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newsData = {
        ...formData,
        author_id: "550e8400-e29b-41d4-a716-446655440001", // ID del admin
      }

      if (editingNews) {
        await updateNews(editingNews.id, newsData)
      } else {
        await createNews(newsData)
      }

      await loadNews()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving news:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      published: newsItem.published,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta noticia?")) {
      try {
        await deleteNews(id)
        await loadNews()
      } catch (error) {
        console.error("Error deleting news:", error)
      }
    }
  }

  const handleSendNotification = async (newsItem: NewsItem) => {
    try {
      // En producción, obtener emails de todos los padres/estudiantes
      const recipients = ["parent1@example.com", "parent2@example.com"]

      for (const email of recipients) {
        await sendEmail(email, `Noticia: ${newsItem.title}`, newsItem.content)
      }

      alert("Notificaciones enviadas exitosamente")
    } catch (error) {
      console.error("Error sending notifications:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      published: false,
    })
    setEditingNews(null)
  }

  const publishedNews = news.filter((n) => n.published)
  const draftNews = news.filter((n) => !n.published)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Noticias</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Noticia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNews ? "Editar Noticia" : "Nueva Noticia"}</DialogTitle>
              <DialogDescription>
                {editingNews ? "Modifica la noticia existente" : "Crea una nueva noticia o comunicado"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título de la noticia..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Escribe el contenido de la noticia..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
                <Label htmlFor="published">Publicar inmediatamente</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : editingNews ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Noticias</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{news.length}</div>
            <p className="text-xs text-muted-foreground">Todas las noticias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicadas</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedNews.length}</div>
            <p className="text-xs text-muted-foreground">Visibles para usuarios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{draftNews.length}</div>
            <p className="text-xs text-muted-foreground">Sin publicar</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de noticias */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Noticias ({news.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {news.map((newsItem) => (
              <div key={newsItem.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{newsItem.title}</h3>
                      {newsItem.published ? (
                        <Badge className="bg-green-100 text-green-800">Publicado</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Borrador</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2 line-clamp-2">{newsItem.content}</p>
                    <p className="text-sm text-gray-500">
                      Creado: {new Date(newsItem.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(newsItem)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {newsItem.published && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendNotification(newsItem)}
                        className="bg-blue-50 hover:bg-blue-100"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(newsItem.id)}
                      className="bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {news.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay noticias creadas aún</p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setIsDialogOpen(true)}>
                  Crear primera noticia
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
