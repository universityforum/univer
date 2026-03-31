import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Eye, Clock, MessageSquare, Pin, Lock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ReplyForm } from '@/components/reply-form'
import { ReplyList } from '@/components/reply-list'
import { LikeButton } from '@/components/like-button'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(*),
      author:profiles(*)
    `)
    .eq('id', id)
    .single()

  if (!post) {
    notFound()
  }

  // Increment views
  await supabase
    .from('posts')
    .update({ views: post.views + 1 })
    .eq('id', id)

  const { data: replies } = await supabase
    .from('replies')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', id)

  let userLiked = false
  if (user) {
    const { data: like } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .single()
    userLiked = !!like
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/forum">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to forum
        </Link>
      </Button>

      <Card className="mb-8">
        <CardContent className="p-6">
          <article className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author?.avatar_url || undefined} alt={post.author?.full_name || 'Author'} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(post.author?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {post.is_pinned && (
                  <Badge variant="secondary" className="bg-secondary/20">
                    <Pin className="h-3 w-3 mr-1" aria-hidden="true" />
                    Pinned
                  </Badge>
                )}
                {post.is_locked && (
                  <Badge variant="outline">
                    <Lock className="h-3 w-3 mr-1" aria-hidden="true" />
                    Locked
                  </Badge>
                )}
                {post.category && (
                  <Badge variant="outline">{post.category.name}</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="font-medium text-foreground">
                  {post.author?.full_name || 'Anonymous'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  <time dateTime={post.created_at}>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</time>
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" aria-hidden="true" />
                  {post.views + 1} views
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" aria-hidden="true" />
                  {replies?.length || 0} replies
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center gap-4">
                <LikeButton 
                  postId={post.id} 
                  initialLikes={likeCount || 0} 
                  initialLiked={userLiked}
                  disabled={!user}
                />
              </div>
            </div>
          </article>
        </CardContent>
      </Card>

      <section className="space-y-6" aria-labelledby="replies-heading">
        <h2 id="replies-heading" className="text-xl font-semibold">
          Replies ({replies?.length || 0})
        </h2>

        <ReplyList replies={replies || []} currentUserId={user?.id} />

        {user && !post.is_locked ? (
          <ReplyForm 
            postId={post.id} 
            postTitle={post.title}
            postAuthorId={post.user_id}
          />
        ) : post.is_locked ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Lock className="h-8 w-8 mx-auto mb-2" aria-hidden="true" />
              This discussion is locked
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Sign in to reply
              </p>
              <Button asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
