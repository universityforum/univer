import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, MessageSquare, Eye, ThumbsUp, Clock, Pin, CheckCircle2, Search, Filter, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Category, Post } from '@/lib/types'

export default async function ForumPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  let postsQuery = supabase
    .from('posts')
    .select(`
      *,
      category:categories(*),
      author:profiles(*),
      replies(count),
      likes(count)
    `)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10)

  if (params.category) {
    postsQuery = postsQuery.eq('category_id', params.category)
  }

  const { data: recentPosts } = await postsQuery
  const { data: { user } } = await supabase.auth.getUser()

  // Count posts per category
  const { data: categoryCounts } = await supabase
    .from('posts')
    .select('category_id')

  const countMap: Record<string, number> = {}
  let totalPosts = 0
  categoryCounts?.forEach(p => {
    countMap[p.category_id] = (countMap[p.category_id] || 0) + 1
    totalPosts++
  })

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Discussion forum</h1>
          <p className="text-primary-foreground/80 mb-6">
            Ask questions, share experiences, and connect with the community.
          </p>
          <search className="flex flex-col sm:flex-row gap-3 max-w-2xl" role="search">
            <div className="relative flex-1">
              <label htmlFor="search-discussions" className="sr-only">Search discussions</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input 
                id="search-discussions"
                placeholder="Search discussions..." 
                className="pl-10 bg-white border-0 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button variant="secondary" className="gap-2" aria-label="Filter discussions">
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filter
            </Button>
          </search>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <aside className="space-y-4" aria-labelledby="categories-heading">
            <h2 id="categories-heading" className="text-lg font-semibold">Categories</h2>
            <nav className="space-y-1" aria-label="Forum categories">
              <Link
                href="/forum"
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  !params.category 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <span className="font-medium">All</span>
                <Badge variant={!params.category ? "secondary" : "outline"} className="ml-2">
                  {totalPosts}
                </Badge>
              </Link>
              {categories?.map((category: Category) => (
                <Link
                  key={category.id}
                  href={`/forum?category=${category.id}`}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    params.category === category.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">{category.name}</span>
                  <Badge variant={params.category === category.id ? "secondary" : "outline"} className="ml-2">
                    {countMap[category.id] || 0}
                  </Badge>
                </Link>
              ))}
            </nav>

            {user && (
              <Button className="w-full gap-2 mt-4" asChild>
                <Link href="/forum/new">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New discussion
                </Link>
              </Button>
            )}
          </aside>

          {/* Main Content - Posts */}
          <section className="lg:col-span-3" aria-labelledby="discussions-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="discussions-heading" className="text-lg font-semibold">All discussions</h2>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" aria-label="Sort by recent">
                <Clock className="h-4 w-4" aria-hidden="true" />
                Recent
              </Button>
            </div>

            <div className="space-y-3">
              {recentPosts && recentPosts.length > 0 ? (
                recentPosts.map((post: Post & { replies: { count: number }[]; likes: { count: number }[] }) => (
                  <Link href={`/forum/${post.id}`} key={post.id}>
                    <Card className="hover:shadow-md transition-all hover:border-primary/20 group">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Avatar className="h-11 w-11 shrink-0">
                            <AvatarImage src={post.author?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {getInitials(post.author?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              {post.is_pinned && (
                                <Badge className="bg-destructive/10 text-destructive border-0 gap-1">
                                  <Pin className="h-3 w-3" />
                                  Pinned
                                </Badge>
                              )}
                              {post.is_solved && (
                                <Badge className="bg-secondary/10 text-secondary border-0 gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Solved
                                </Badge>
                              )}
                              <Badge variant="outline" className="font-normal">
                                {post.category?.name || 'General'}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                              {post.title}
                            </h3>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <span className="font-medium text-foreground">{post.author?.full_name?.split(' ')[0] || 'User'}</span>
                                <span>{post.author?.full_name?.split(' ').slice(1).map(n => n[0] + '.').join('') || ''}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {post.replies?.[0]?.count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                {post.views || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3.5 w-3.5" />
                                {post.likes?.[0]?.count || 0}
                              </span>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to start a discussion!
                    </p>
                    {user && (
                      <Button asChild>
                        <Link href="/forum/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Create discussion
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pagination */}
            {recentPosts && recentPosts.length > 0 && (
              <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="default" size="sm" className="w-8 h-8 p-0" aria-current="page">1</Button>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">2</Button>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">3</Button>
                <Button variant="outline" size="sm">Next</Button>
              </nav>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
