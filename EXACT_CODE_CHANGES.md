# Quick Reference - Exact Code Changes

## 1. Enhanced Middleware for Role-Based Routing
**File**: `lib/supabase/middleware.ts`

Key additions:
```typescript
// Protect specific routes that require authentication
const protectedPaths = ['/admin', '/profile', '/settings', '/notifications', '/mentors', '/forum/new']
const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

if (isProtectedPath && !user) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}

// Redirect authenticated users to their dashboard
if (user && (pathname === '/login' || pathname === '/')) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'student'
  const url = request.nextUrl.clone()

  if (userRole === 'admin') {
    url.pathname = '/admin'
  } else {
    url.pathname = '/forum'
  }

  return NextResponse.redirect(url)
}
```

---

## 2. Home Page Authentication Check
**File**: `app/page.tsx`

Key additions at the top of the component:
```typescript
export default async function HomePage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  // If user is authenticated, redirect to appropriate dashboard
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const userRole = profile?.role || 'student'
    
    if (userRole === 'admin') {
      redirect('/admin')
    } else {
      redirect('/forum')
    }
  }

  // Rest of page... (only renders for unauthenticated users)
}
```

---

## 3. Protected Main Layout
**File**: `app/(main)/layout.tsx`

Key changes:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Rest of layout...
}
```

---

## 4. Auth Helper Functions (Optional - for future use)
**File**: `lib/auth-helpers.ts`

```typescript
export async function getAuthUserWithRole() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (!user || userError) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  return { user, profile }
}

// Use in any server component:
// const { user, profile } = await getAuthUserWithRole()
```

---

## 5. OAuth Callback Handler
**File**: `app/auth/callback/page.tsx`

```typescript
export default async function AuthCallbackPage() {
  const supabase = await createClient()
  const code = searchParams.get('code')

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  redirect('/forum')
}
```

---

## 6. Database RLS Policies (Run in Supabase SQL Editor)
**File**: `scripts/fix-posts-fk.sql`

Key SQL:
```sql
-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Enforce: Only authenticated users can create posts
CREATE POLICY "Users can insert their own posts" ON posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own posts
CREATE POLICY "Users can update their own posts" ON posts
FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own posts
CREATE POLICY "Users can delete their own posts" ON posts
FOR DELETE USING (auth.uid() = user_id);

-- Anyone can view posts
CREATE POLICY "Anyone can view posts" ON posts
FOR SELECT USING (true);
```

---

## How These Changes Work Together

1. **User signs in** → createClient() makes authenticated call → Session stored in cookies
2. **User gets redirected** → Middleware intercepts request → Checks auth + role → Redirects to dashboard
3. **User refreshes page** → Middleware re-validates session → User stays authenticated
4. **User visits /login while authenticated** → Middleware redirects to dashboard
5. **User visits protected route without auth** → Layout checks auth → Redirects to login
6. **User creates post** → Backend checks auth.uid() via RLS → Prevents foreign key error

All these layers work together to ensure:
- ✅ No redirect loops
- ✅ Sessions persist
- ✅ Authenticated users go to correct dashboard
- ✅ Unauthenticated users can't access protected pages
- ✅ Posts are always created by valid authenticated users
- ✅ Works after refresh and direct URL access
