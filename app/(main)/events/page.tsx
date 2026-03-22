import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import { format, isFuture, isPast, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      creator:profiles(full_name)
    `)
    .order('start_date', { ascending: true })

  const upcomingEvents = events?.filter(e => isFuture(new Date(e.start_date)) || isToday(new Date(e.start_date))) || []
  const pastEvents = events?.filter(e => isPast(new Date(e.start_date)) && !isToday(new Date(e.start_date))) || []

  const getEventStatus = (startDate: string) => {
    if (isToday(new Date(startDate))) {
      return { label: "Aujourd'hui", color: 'bg-green-500/10 text-green-700' }
    }
    if (isFuture(new Date(startDate))) {
      return { label: 'À venir', color: 'bg-blue-500/10 text-blue-700' }
    }
    return { label: 'Passé', color: 'bg-gray-500/10 text-gray-700' }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Événements</h1>
        <p className="text-muted-foreground">
          Découvrez les événements universitaires à venir
        </p>
      </div>

      <div className="space-y-8">
        {upcomingEvents.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Événements à venir
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => {
                const status = getEventStatus(event.start_date)
                return (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
                      {event.description && (
                        <CardDescription className="line-clamp-2">
                          {event.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(event.start_date), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Organisé par {event.creator?.full_name || 'Administration'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {upcomingEvents.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun événement à venir</h3>
              <p className="text-muted-foreground">
                Revenez bientôt pour découvrir les prochains événements
              </p>
            </CardContent>
          </Card>
        )}

        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
              Événements passés
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastEvents.slice(0, 6).map((event) => (
                <Card key={event.id} className="opacity-60">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">{event.title}</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.start_date), 'd MMMM yyyy', { locale: fr })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
