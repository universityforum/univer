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
  low: 'Low',
  medium: 'Medium',
  high: 'High',
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
        No announcements created
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
                By {announcement.creator?.full_name || 'Anonymous'} - {' '}
                {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => toggleActive(announcement)}
                aria-label={announcement.is_active ? 'Deactivate' : 'Activate'}
              >
                {announcement.is_active ? (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openEdit(announcement)} aria-label="Edit">
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setDeleteAnnouncement(announcement)}
                className="text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editAnnouncement} onOpenChange={() => setEditAnnouncement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea 
                id="edit-content"
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}>
                <SelectTrigger id="edit-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">Active</Label>
              <Switch id="edit-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAnnouncement(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={loading || !title.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteAnnouncement} onOpenChange={() => setDeleteAnnouncement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteAnnouncement?.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAnnouncement(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
