'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, Trash2 } from 'lucide-react'
import type { Category } from '@/lib/types'

interface CategoryListProps {
  categories: (Category & { posts: { count: number }[] })[]
}

export function CategoryList({ categories }: CategoryListProps) {
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const openEdit = (category: Category) => {
    setEditCategory(category)
    setName(category.name)
    setDescription(category.description || '')
  }

  const handleEdit = async () => {
    if (!editCategory) return
    setLoading(true)
    
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    await supabase
      .from('categories')
      .update({ name, description, slug })
      .eq('id', editCategory.id)
    
    setLoading(false)
    setEditCategory(null)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteCategory) return
    setLoading(true)
    
    await supabase
      .from('categories')
      .delete()
      .eq('id', deleteCategory.id)
    
    setLoading(false)
    setDeleteCategory(null)
    router.refresh()
  }

  if (categories.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Aucune catégorie créée
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{category.name}</span>
                <Badge variant="secondary">
                  {category.posts?.[0]?.count || 0} posts
                </Badge>
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {category.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Slug: {category.slug}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setDeleteCategory(category)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategory(null)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={loading || !name.trim()}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la catégorie</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{deleteCategory?.name}" ?
              Les discussions associées ne seront plus catégorisées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCategory(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
