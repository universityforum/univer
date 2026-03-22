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
import { Pencil, Trash2, Users } from 'lucide-react'
import type { Club, Profile } from '@/lib/types'

interface ClubListProps {
  clubs: (Club & { creator: Profile | null; club_members: { count: number }[] })[]
}

export function ClubList({ clubs }: ClubListProps) {
  const [editClub, setEditClub] = useState<Club | null>(null)
  const [deleteClub, setDeleteClub] = useState<Club | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const openEdit = (club: Club) => {
    setEditClub(club)
    setName(club.name)
    setDescription(club.description || '')
  }

  const handleEdit = async () => {
    if (!editClub) return
    setLoading(true)
    
    await supabase
      .from('clubs')
      .update({
        name,
        description: description || null,
      })
      .eq('id', editClub.id)
    
    setLoading(false)
    setEditClub(null)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteClub) return
    setLoading(true)
    
    await supabase
      .from('clubs')
      .delete()
      .eq('id', deleteClub.id)
    
    setLoading(false)
    setDeleteClub(null)
    router.refresh()
  }

  if (clubs.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Aucun club créé
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {clubs.map((club) => (
          <div
            key={club.id}
            className="flex items-start justify-between p-4 rounded-lg border bg-card"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{club.name}</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {club.club_members?.[0]?.count || 0}
                </Badge>
              </div>
              {club.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {club.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Créé par {club.creator?.full_name || 'Anonyme'}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="icon" onClick={() => openEdit(club)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setDeleteClub(club)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editClub} onOpenChange={() => setEditClub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le club</DialogTitle>
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
            <Button variant="outline" onClick={() => setEditClub(null)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={loading || !name.trim()}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteClub} onOpenChange={() => setDeleteClub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le club</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{deleteClub?.name}" ?
              Tous les membres seront retirés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteClub(null)}>
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
