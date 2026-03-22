import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus } from 'lucide-react'
import { JoinClubButton } from '@/components/join-club-button'

export default async function ClubsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: clubs } = await supabase
    .from('clubs')
    .select(`
      *,
      creator:profiles(full_name),
      club_members(count)
    `)
    .order('name')

  let userMemberships: string[] = []
  if (user) {
    const { data: memberships } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', user.id)
    userMemberships = memberships?.map(m => m.club_id) || []
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Clubs</h1>
        <p className="text-muted-foreground">
          Rejoignez des clubs universitaires et participez à des activités enrichissantes
        </p>
      </div>

      {clubs && clubs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => {
            const isMember = userMemberships.includes(club.id)
            const memberCount = club.club_members?.[0]?.count || 0
            
            return (
              <Card key={club.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{club.name}</CardTitle>
                      {club.description && (
                        <CardDescription className="mt-2 line-clamp-3">
                          {club.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {memberCount} membre{memberCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {user ? (
                      <JoinClubButton 
                        clubId={club.id} 
                        isMember={isMember} 
                      />
                    ) : (
                      <Badge variant="outline">Connectez-vous pour rejoindre</Badge>
                    )}
                  </div>
                  {isMember && (
                    <Badge className="mt-3 bg-secondary/20 text-secondary-foreground">
                      Membre
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun club disponible</h3>
            <p className="text-muted-foreground">
              Les clubs seront bientôt disponibles
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
