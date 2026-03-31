import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'admin' | 'moderator' | 'student'

/**
 * Server-side helper to get current user and their role.
 * Throws redirect if user is not authenticated.
 */
export async function getAuthUserWithRole() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (!user || userError) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, full_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Profile fetch error:', profileError)
    redirect('/login')
  }

  return {
    user,
    profile: profile as { id: string; role: UserRole; full_name: string; email: string; avatar_url: string | null },
  }
}

/**
 * Protect a route and require a specific role
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const { profile } = await getAuthUserWithRole()
  
  if (!allowedRoles.includes(profile.role)) {
    // Redirect to appropriate dashboard based on their role
    if (profile.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/forum')
    }
  }

  return profile
}
