'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  postId?: string
  replyId?: string
  initialLikes: number
  initialLiked: boolean
  disabled?: boolean
}

export function LikeButton({ postId, replyId, initialLikes, initialLiked, disabled }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(initialLiked)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLike = async () => {
    if (disabled || loading) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setLoading(false)
      return
    }

    if (liked) {
      // Unlike
      const query = supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
      
      if (postId) {
        await query.eq('post_id', postId)
      } else if (replyId) {
        await query.eq('reply_id', replyId)
      }

      setLikes(prev => prev - 1)
      setLiked(false)
    } else {
      // Like
      const insertData: { user_id: string; post_id?: string; reply_id?: string } = {
        user_id: user.id,
      }
      
      if (postId) insertData.post_id = postId
      if (replyId) insertData.reply_id = replyId

      await supabase.from('likes').insert(insertData)

      setLikes(prev => prev + 1)
      setLiked(true)
    }

    setLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={disabled || loading}
      className={`gap-2 ${liked ? 'text-red-500' : ''}`}
    >
      <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
      {likes}
    </Button>
  )
}
