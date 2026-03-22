'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MoreHorizontal, Pin, PinOff, Lock, Unlock, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { Post } from '@/lib/types'

interface PostActionsProps {
  post: Post
}

export function PostActions({ post }: PostActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const togglePin = async () => {
    setLoading(true)
    await supabase
      .from('posts')
      .update({ is_pinned: !post.is_pinned })
      .eq('id', post.id)
    setLoading(false)
    router.refresh()
  }

  const toggleLock = async () => {
    setLoading(true)
    await supabase
      .from('posts')
      .update({ is_locked: !post.is_locked })
      .eq('id', post.id)
    setLoading(false)
    router.refresh()
  }

  const handleDelete = async () => {
    setLoading(true)
    await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)
    setLoading(false)
    setDeleteDialogOpen(false)
    router.refresh()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={loading} aria-label="Post actions">
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/forum/${post.id}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={togglePin}>
            {post.is_pinned ? (
              <>
                <PinOff className="h-4 w-4 mr-2" aria-hidden="true" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 mr-2" aria-hidden="true" />
                Pin
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleLock}>
            {post.is_locked ? (
              <>
                <Unlock className="h-4 w-4 mr-2" aria-hidden="true" />
                Unlock
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" aria-hidden="true" />
                Lock
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Discussion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this discussion? 
              All replies will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
