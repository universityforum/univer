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
import { Pencil, Trash2, Calendar, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Event, Profile } from '@/lib/types'

interface EventListProps {
  events: (Event & { creator: Profile | null })[]
}

export function EventList({ events }: EventListProps) {
  const [editEvent, setEditEvent] = useState<Event | null>(null)
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const openEdit = (event: Event) => {
    setEditEvent(event)
    setTitle(event.title)
    setDescription(event.description || '')
    setLocation(event.location || '')
    setStartDate(event.start_date.slice(0, 16))
    setEndDate(event.end_date?.slice(0, 16) || '')
  }

  const handleEdit = async () => {
    if (!editEvent) return
    setLoading(true)
    
    await supabase
      .from('events')
      .update({
        title,
        description: description || null,
        location: location || null,
        start_date: startDate,
        end_date: endDate || null,
      })
      .eq('id', editEvent.id)
    
    setLoading(false)
    setEditEvent(null)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteEvent) return
    setLoading(true)
    
    await supabase
      .from('events')
      .delete()
      .eq('id', deleteEvent.id)
    
    setLoading(false)
    setDeleteEvent(null)
    router.refresh()
  }

  const isPast = (date: string) => new Date(date) < new Date()

  if (events.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Aucun événement créé
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className={`flex items-start justify-between p-4 rounded-lg border bg-card ${
              isPast(event.start_date) ? 'opacity-60' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{event.title}</span>
                {isPast(event.start_date) ? (
                  <Badge variant="secondary">Passé</Badge>
                ) : (
                  <Badge className="bg-green-500/10 text-green-700">À venir</Badge>
                )}
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {event.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(event.start_date), 'PPP à HH:mm', { locale: fr })}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="icon" onClick={() => openEdit(event)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setDeleteEvent(event)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editEvent} onOpenChange={() => setEditEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l{"'"}événement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Lieu</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input 
                  type="datetime-local" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input 
                  type="datetime-local" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEvent(null)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={loading || !title.trim()}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteEvent} onOpenChange={() => setDeleteEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l{"'"}événement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{deleteEvent?.title}" ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEvent(null)}>
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
