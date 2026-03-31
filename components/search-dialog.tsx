'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Search, FileText, Calendar, Users, MessageSquare, User } from 'lucide-react'
import type { Post, Event, Club, Profile } from '@/lib/types'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SearchResult = {
  type: 'post' | 'event' | 'club' | 'user'
  id: string
  title: string
  description?: string
  href: string
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClient()

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    const searchResults: SearchResult[] = []

    // Search posts
    const { data: posts } = await supabase
      .from('posts')
      .select('id, title, content')
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      .limit(5)

    if (posts) {
      posts.forEach((post: Pick<Post, 'id' | 'title' | 'content'>) => {
        searchResults.push({
          type: 'post',
          id: post.id,
          title: post.title,
          description: post.content.substring(0, 100) + '...',
          href: `/forum/${post.id}`,
        })
      })
    }

    // Search events
    const { data: events } = await supabase
      .from('events')
      .select('id, title, description')
      .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      .limit(3)

    if (events) {
      events.forEach((event: Pick<Event, 'id' | 'title' | 'description'>) => {
        searchResults.push({
          type: 'event',
          id: event.id,
          title: event.title,
          description: event.description?.substring(0, 100) || undefined,
          href: `/events`,
        })
      })
    }

    // Search clubs
    const { data: clubs } = await supabase
      .from('clubs')
      .select('id, name, description')
      .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      .limit(3)

    if (clubs) {
      clubs.forEach((club: Pick<Club, 'id' | 'name' | 'description'>) => {
        searchResults.push({
          type: 'club',
          id: club.id,
          title: club.name,
          description: club.description?.substring(0, 100) || undefined,
          href: `/clubs`,
        })
      })
    }

    // Search users
    const { data: users } = await supabase
      .from('profiles')
      .select('id, full_name, email, department')
      .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      .limit(3)

    if (users) {
      users.forEach((user: Pick<Profile, 'id' | 'full_name' | 'email' | 'department'>) => {
        searchResults.push({
          type: 'user',
          id: user.id,
          title: user.full_name || user.email,
          description: user.department || undefined,
          href: `/profile`,
        })
      })
    }

    setResults(searchResults)
    setLoading(false)
  }, [supabase])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleSelect = (result: SearchResult) => {
    saveRecentSearch(result.title)
    onOpenChange(false)
    setQuery('')
    router.push(result.href)
  }

  const handleRecentSearch = (term: string) => {
    setQuery(term)
    performSearch(term)
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="h-4 w-4" />
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'club':
        return <Users className="h-4 w-4" />
      case 'user':
        return <User className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: SearchResult['type']) => {
    const labels = {
      post: 'Discussion',
      event: 'Event',
      club: 'Club',
      user: 'User',
    }
    return labels[type]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search discussions, events, clubs, users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 text-base"
            autoFocus
          />
          {loading && <Spinner className="h-5 w-5" />}
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted text-left transition-colors"
                >
                  <div className="flex-shrink-0 mt-1 text-muted-foreground">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{result.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getTypeBadge(result.type)}
                      </Badge>
                    </div>
                    {result.description && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {result.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 && !loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="space-y-4 p-2">
              {recentSearches.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Recent searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearch(term)}
                        className="px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-muted/80 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Quick links</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { onOpenChange(false); router.push('/forum') }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">Forum</span>
                  </button>
                  <button
                    onClick={() => { onOpenChange(false); router.push('/events') }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Events</span>
                  </button>
                  <button
                    onClick={() => { onOpenChange(false); router.push('/clubs') }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Clubs</span>
                  </button>
                  <button
                    onClick={() => { onOpenChange(false); router.push('/mentors') }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm">Mentors</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-2 text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Esc</kbd> to close
        </div>
      </DialogContent>
    </Dialog>
  )
}
