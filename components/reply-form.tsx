'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { notifyPostReply } from '@/lib/notifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'

interface ReplyFormProps {
  postId: string
  postTitle: string
  postAuthorId: string
  parentId?: string
  onSuccess?: () => void
}

export function ReplyForm({ postId, postTitle, postAuthorId, parentId, onSuccess }: ReplyFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    // Get current user's profile for the notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { error: replyError } = await supabase
      .from('replies')
      .insert({
        content: content.trim(),
        post_id: postId,
        parent_id: parentId || null,
        user_id: user.id,
      })

    if (replyError) {
      setError(replyError.message)
    } else {
      // Notify post author (only if replier is not the author)
      if (user.id !== postAuthorId) {
        await notifyPostReply(
          postAuthorId,
          profile?.full_name || 'Someone',
          postTitle,
          postId
        )
      }
      setContent('')
      router.refresh()
      onSuccess?.()
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardContent className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Write a reply..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
            aria-label="Reply content"
          />
          <Button type="submit" disabled={loading || !content.trim()}>
            {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
            Reply
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
