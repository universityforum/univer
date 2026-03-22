'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Reply, Profile } from '@/lib/types'

interface ReplyListProps {
  replies: (Reply & { author: Profile | null })[]
  currentUserId?: string
}

export function ReplyList({ replies }: ReplyListProps) {
  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (replies.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Aucune réponse pour le moment. Soyez le premier à répondre !
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <Card key={reply.id} className={reply.is_solution ? 'border-secondary' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={reply.author?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(reply.author?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-medium">
                    {reply.author?.full_name || 'Anonyme'}
                  </span>
                  {reply.author?.role && (
                    <Badge variant="secondary" className="capitalize text-xs">
                      {reply.author.role}
                    </Badge>
                  )}
                  {reply.is_solution && (
                    <Badge className="bg-secondary text-secondary-foreground">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Solution
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
