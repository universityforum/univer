import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Heart, Calendar, Mail, Building2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ProfileEditForm } from '@/components/profile-edit-form'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(*),
      replies(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: replies } = await supabase
    .from('replies')
    .select(`
      *,
      post:posts(id, title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: replyCount } = await supabase
    .from('replies')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {profile?.email}
                </p>
                <Badge className="mt-2 capitalize">{profile?.role}</Badge>
                {profile?.department && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {profile.department}
                  </p>
                )}
                {profile?.bio && (
                  <p className="text-sm mt-4 text-muted-foreground">{profile.bio}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Discussions
                </span>
                <span className="font-semibold">{postCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  Replies
                </span>
                <span className="font-semibold">{replyCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Member since
                </span>
                <span className="font-semibold text-sm">
                  {profile?.created_at
                    ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })
                    : '-'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="posts">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="posts">My Discussions</TabsTrigger>
              <TabsTrigger value="replies">My Replies</TabsTrigger>
              <TabsTrigger value="settings">Edit Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-6">
              {posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-4">
                        <Link href={`/forum/${post.id}`} className="block group">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {post.content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">{post.category?.name || 'General'}</Badge>
                            <span>{post.replies?.[0]?.count || 0} replies</span>
                            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No discussions created yet
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="replies" className="mt-6">
              {replies && replies.length > 0 ? (
                <div className="space-y-4">
                  {replies.map((reply) => (
                    <Card key={reply.id}>
                      <CardContent className="p-4">
                        <Link href={`/forum/${reply.post?.id}`} className="block group">
                          <p className="text-sm text-muted-foreground mb-1">
                            In reply to: <span className="font-medium text-foreground group-hover:text-primary transition-colors">{reply.post?.title}</span>
                          </p>
                          <p className="text-sm line-clamp-2">{reply.content}</p>
                          <span className="text-xs text-muted-foreground mt-2 block">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </span>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No replies posted yet
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileEditForm profile={profile} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
