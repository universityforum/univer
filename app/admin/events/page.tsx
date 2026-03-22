import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EventList } from '@/components/admin/event-list'
import { EventForm } from '@/components/admin/event-form'

export default async function AdminEventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      creator:profiles(full_name)
    `)
    .order('start_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Events</h1>
        <p className="text-muted-foreground">
          Manage university events
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Event List</CardTitle>
              <CardDescription>
                {events?.length || 0} event(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventList events={events || []} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>New Event</CardTitle>
              <CardDescription>
                Create an event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
