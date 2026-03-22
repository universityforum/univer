'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CheckCheck, MoreHorizontal, Trash2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface NotificationActionsProps {
  userId: string
  hasUnread: boolean
}

export function NotificationActions({ userId, hasUnread }: NotificationActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const markAllRead = async () => {
    setLoading(true)
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    router.refresh()
    setLoading(false)
  }

  const deleteAll = async () => {
    setLoading(true)
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
    router.refresh()
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hasUnread && (
          <DropdownMenuItem onClick={markAllRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={deleteAll} className="gap-2 text-destructive">
          <Trash2 className="h-4 w-4" />
          Delete all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
