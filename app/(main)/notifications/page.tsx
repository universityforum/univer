import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  MessageSquare, 
  Heart, 
  AtSign, 
  Megaphone, 
  Calendar,
  Check,
  CheckCheck,
  Trash2 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { NotificationActions } from '@/components/notification-actions'

export const metadata = {
  title: 'Notifications | University Forum',
  description: 'View and manage your notifications.',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0

  const getIcon = (type: string) => {
    switch (type) {
      case 'reply':
        return <MessageSquare className="h-5 w-5" />
      case 'like':
        return <Heart className="h-5 w-5" />
      case 'mention':
        return <AtSign className="h-5 w-5" />
      case 'announcement':
        return <Megaphone className="h-5 w-5" />
      case 'event':
        return <Calendar className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reply':
        return 'bg-blue-100 text-blue-700'
      case 'like':
        return 'bg-pink-100 text-pink-700'
      case 'mention':
        return 'bg-purple-100 text-purple-700'
      case 'announcement':
        return 'bg-orange-100 text-orange-700'
      case 'event':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You are all caught up!'
            }
          </p>
        </div>
        {notifications && notifications.length > 0 && (
          <NotificationActions userId={user.id} hasUnread={unreadCount > 0} />
        )}
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${
                !notification.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-4">
                <Link 
                  href={notification.link || '#'} 
                  className="flex items-start gap-4 group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getTypeColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold group-hover:text-primary transition-colors ${
                        !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <Badge variant="default" className="shrink-0 text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Notifications</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              When you receive replies, likes, or mentions, they will appear here.
            </p>
            <Button variant="outline" className="mt-6 rounded-full" asChild>
              <Link href="/forum">Explore the Forum</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences Card */}
      <Card className="mt-8 bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">Replies</p>
                  <p className="text-xs text-muted-foreground">When someone replies to your posts</p>
                </div>
              </div>
              <Badge variant="secondary">On</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">Likes</p>
                  <p className="text-xs text-muted-foreground">When someone likes your content</p>
                </div>
              </div>
              <Badge variant="secondary">On</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">Announcements</p>
                  <p className="text-xs text-muted-foreground">Important updates from administrators</p>
                </div>
              </div>
              <Badge variant="secondary">On</Badge>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-6 rounded-lg" asChild>
            <Link href="/settings">Manage All Settings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
