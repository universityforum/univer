'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import type { Profile } from '@/lib/types'

interface ProfileEditFormProps {
  profile: Profile | null
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [department, setDepartment] = useState(profile?.department || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Vous devez être connecté')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        department,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-secondary/20 text-secondary-foreground rounded-lg text-sm">
          Profil mis à jour avec succès !
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Nom complet</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Votre nom complet"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Département / Filière</Label>
        <Input
          id="department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Ex: Informatique, Droit, Médecine..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Parlez un peu de vous..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? <Spinner className="h-4 w-4 mr-2" /> : null}
        Enregistrer
      </Button>
    </form>
  )
}
