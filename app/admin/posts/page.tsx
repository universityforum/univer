import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { PostActions } from '@/components/admin/post-actions'
import { Pin, Lock, Eye, MessageSquare } from 'lucide-react'

export default async function AdminPostsPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(full_name, email),
      category:categories(name),
      replies(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Discussions</h1>
        <p className="text-muted-foreground">
          Manage all forum discussions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discussion List</CardTitle>
          <CardDescription>
            {posts?.length || 0} discussion(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Author</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Stats</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-muted/50">
                      <td className="py-4">
                        <Link 
                          href={`/forum/${post.id}`} 
                          className="font-medium hover:text-primary line-clamp-1 max-w-xs"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {post.author?.full_name || post.author?.email || 'Anonymous'}
                      </td>
                      <td className="py-4">
                        <Badge variant="outline">
                          {post.category?.name || 'Uncategorized'}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" aria-hidden="true" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" aria-hidden="true" />
                            {post.replies?.[0]?.count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          {post.is_pinned && (
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">
                              <Pin className="h-3 w-3 mr-1" aria-hidden="true" />
                              Pinned
                            </Badge>
                          )}
                          {post.is_locked && (
                            <Badge variant="secondary" className="bg-red-500/10 text-red-700">
                              <Lock className="h-3 w-3 mr-1" aria-hidden="true" />
                              Locked
                            </Badge>
                          )}
                          {!post.is_pinned && !post.is_locked && (
                            <span className="text-sm text-muted-foreground">Normal</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </td>
                      <td className="py-4">
                        <PostActions post={post} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No discussions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
