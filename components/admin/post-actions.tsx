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
          <Button variant="ghost" size="icon" disabled={loading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/forum/${post.id}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={togglePin}>
            {post.is_pinned ? (
              <>
                <PinOff className="h-4 w-4 mr-2" />
                Désépingler
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 mr-2" />
                Épingler
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleLock}>
            {post.is_locked ? (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Déverrouiller
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Verrouiller
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la discussion</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette discussion ? 
              Toutes les réponses seront également supprimées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
