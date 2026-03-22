'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { UserPlus, UserMinus } from 'lucide-react'

interface JoinClubButtonProps {
  clubId: string
  isMember: boolean
}

export function JoinClubButton({ clubId, isMember }: JoinClubButtonProps) {
  const [loading, setLoading] = useState(false)
  const [member, setMember] = useState(isMember)
  const router = useRouter()
  const supabase = createClient()

  const handleToggle = async () => {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    if (member) {
      await supabase
        .from('club_members')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', user.id)
      setMember(false)
    } else {
      await supabase
        .from('club_members')
        .insert({
          club_id: clubId,
          user_id: user.id,
          role: 'member',
        })
      setMember(true)
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      variant={member ? 'outline' : 'default'}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {member ? (
        <>
          <UserMinus className="h-4 w-4 mr-1" />
          Quitter
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1" />
          Rejoindre
        </>
      )}
    </Button>
  )
}
