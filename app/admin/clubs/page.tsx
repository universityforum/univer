import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClubList } from '@/components/admin/club-list'
import { ClubForm } from '@/components/admin/club-form'

export default async function AdminClubsPage() {
  const supabase = await createClient()

  const { data: clubs } = await supabase
    .from('clubs')
    .select(`
      *,
      creator:profiles(full_name),
      club_members(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Clubs</h1>
        <p className="text-muted-foreground">
          Gérer les clubs universitaires
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Liste des clubs</CardTitle>
              <CardDescription>
                {clubs?.length || 0} club(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClubList clubs={clubs || []} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Nouveau club</CardTitle>
              <CardDescription>
                Créer un club
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClubForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
