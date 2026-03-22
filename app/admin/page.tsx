import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MessageSquare, Calendar, Users2, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })

  const { count: replyCount } = await supabase
    .from('replies')
    .select('*', { count: 'exact', head: true })

  const { count: eventCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })

  const { count: clubCount } = await supabase
    .from('clubs')
    .select('*', { count: 'exact', head: true })

  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentPosts } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Users', value: userCount || 0, icon: Users, href: '/admin/users', color: 'bg-blue-500' },
    { label: 'Discussions', value: postCount || 0, icon: MessageSquare, href: '/admin/posts', color: 'bg-green-500' },
    { label: 'Replies', value: replyCount || 0, icon: Activity, href: '/admin/posts', color: 'bg-purple-500' },
    { label: 'Events', value: eventCount || 0, icon: Calendar, href: '/admin/events', color: 'bg-orange-500' },
    { label: 'Clubs', value: clubCount || 0, icon: Users2, href: '/admin/clubs', color: 'bg-pink-500' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of the University Forum platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}/10`}>
                      <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} aria-hidden="true" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" aria-hidden="true" />
              New Users
            </CardTitle>
            <CardDescription>Last 5 registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers && recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                    <div>
                      <p className="font-medium">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded">
                      {user.role}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No users</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
              Recent Discussions
            </CardTitle>
            <CardDescription>Last 5 discussions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts && recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{post.title}</p>
                      <p className="text-sm text-muted-foreground">
                        by {post.author?.full_name || 'Anonymous'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {post.views} views
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No discussions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
