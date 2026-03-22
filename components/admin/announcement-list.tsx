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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Announcement, Profile } from '@/lib/types'

interface AnnouncementListProps {
  announcements: (Announcement & { creator: Profile | null })[]
}

const priorityColors: Record<string, string> = {
  low: 'bg-green-500/10 text-green-700',
  medium: 'bg-yellow-500/10 text-yellow-700',
  high: 'bg-red-500/10 text-red-700',
}

const priorityLabels: Record<string, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
}

export function AnnouncementList({ announcements }: AnnouncementListProps) {
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null)
  const [deleteAnnouncement, setDeleteAnnouncement] = useState<Announcement | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const openEdit = (announcement: Announcement) => {
    setEditAnnouncement(announcement)
    setTitle(announcement.title)
    setContent(announcement.content)
    setPriority(announcement.priority)
    setIsActive(announcement.is_active)
  }

  const handleEdit = async () => {
    if (!editAnnouncement) return
    setLoading(true)
    
    await supabase
      .from('announcements')
      .update({
        title,
        content,
        priority,
        is_active: isActive,
      })
      .eq('id', editAnnouncement.id)
    
    setLoading(false)
    setEditAnnouncement(null)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteAnnouncement) return
    setLoading(true)
    
    await supabase
      .from('announcements')
      .delete()
      .eq('id', deleteAnnouncement.id)
    
    setLoading(false)
    setDeleteAnnouncement(null)
    router.refresh()
  }

  const toggleActive = async (announcement: Announcement) => {
    await supabase
      .from('announcements')
      .update({ is_active: !announcement.is_active })
      .eq('id', announcement.id)
    router.refresh()
  }

  if (announcements.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Aucune annonce créée
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`flex items-start justify-between p-4 rounded-lg border bg-card ${
              !announcement.is_active ? 'opacity-60' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{announcement.title}</span>
                <Badge className={priorityColors[announcement.priority]}>
                  {priorityLabels[announcement.priority]}
                </Badge>
                {!announcement.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {announcement.content}
              </p>
              <p className="text-xs text-muted-foreground">
                Par {announcement.creator?.full_name || 'Anonyme'} - {' '}
                {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true, locale: fr })}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => toggleActive(announcement)}
                title={announcement.is_active ? 'Désactiver' : 'Activer'}
              >
                {announcement.is_active ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openEdit(announcement)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setDeleteAnnouncement(announcement)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editAnnouncement} onOpenChange={() => setEditAnnouncement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l{"'"}annonce</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contenu</Label>
              <Textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAnnouncement(null)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={loading || !title.trim()}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteAnnouncement} onOpenChange={() => setDeleteAnnouncement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l{"'"}annonce</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{deleteAnnouncement?.title}" ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAnnouncement(null)}>
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
