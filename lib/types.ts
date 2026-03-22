export type UserRole = 'student' | 'teacher' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  bio: string | null
  department: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  slug: string
  icon: string | null
  color: string | null
  created_at: string
  post_count?: number
}

export interface Post {
  id: string
  title: string
  content: string
  category_id: string
  user_id: string
  is_pinned: boolean
  is_locked: boolean
  views: number
  created_at: string
  updated_at: string
  category?: Category
  author?: Profile
  reply_count?: number
  like_count?: number
  liked_by_user?: boolean
}

export interface Reply {
  id: string
  content: string
  post_id: string
  user_id: string
  parent_id: string | null
  is_solution: boolean
  created_at: string
  updated_at: string
  author?: Profile
  like_count?: number
  liked_by_user?: boolean
}

export interface Like {
  id: string
  user_id: string
  post_id: string | null
  reply_id: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'reply' | 'like' | 'mention' | 'announcement' | 'event'
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  location: string | null
  start_date: string
  end_date: string | null
  created_by: string
  created_at: string
  creator?: Profile
}

export interface Club {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  created_by: string
  created_at: string
  member_count?: number
  is_member?: boolean
  creator?: Profile
}

export interface ClubMember {
  id: string
  club_id: string
  user_id: string
  role: 'member' | 'moderator' | 'admin'
  joined_at: string
  member?: Profile
}

export interface Announcement {
  id: string
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  is_active: boolean
  created_by: string
  created_at: string
  expires_at: string | null
  creator?: Profile
}
