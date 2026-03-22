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
        No events created
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
                  <Badge variant="secondary">Past</Badge>
                ) : (
                  <Badge className="bg-green-500/10 text-green-700">Upcoming</Badge>
                )}
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {event.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  {format(new Date(event.start_date), 'PPP \'at\' HH:mm')}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="icon" onClick={() => openEdit(event)} aria-label="Edit">
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setDeleteEvent(event)}
                className="text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editEvent} onOpenChange={() => setEditEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-event-title">Title</Label>
              <Input id="edit-event-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event-desc">Description</Label>
              <Textarea 
                id="edit-event-desc"
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event-location">Location</Label>
              <Input id="edit-event-location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-event-start">Start date</Label>
                <Input 
                  id="edit-event-start"
                  type="datetime-local" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-event-end">End date</Label>
                <Input 
                  id="edit-event-end"
                  type="datetime-local" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEvent(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={loading || !title.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteEvent} onOpenChange={() => setDeleteEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteEvent?.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEvent(null)}>
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
