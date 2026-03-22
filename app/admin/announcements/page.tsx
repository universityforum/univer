import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnnouncementList } from '@/components/admin/announcement-list'
import { AnnouncementForm } from '@/components/admin/announcement-form'

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient()

  const { data: announcements } = await supabase
    .from('announcements')
    .select(`
      *,
      creator:profiles(full_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Annonces</h1>
        <p className="text-muted-foreground">
          Gérer les annonces de la plateforme
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Liste des annonces</CardTitle>
              <CardDescription>
                {announcements?.length || 0} annonce(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementList announcements={announcements || []} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle annonce</CardTitle>
              <CardDescription>
                Créer une annonce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
