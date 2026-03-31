import { createClient } from '@/lib/supabase/client'

export type NotificationType = 'reply' | 'like' | 'mention' | 'announcement' | 'event'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

/**
 * Creates a notification for a user
 * This function can be called from client-side code
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      link,
      is_read: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create notification:', error)
    return null
  }

  return data
}

/**
 * Creates notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  const supabase = createClient()
  
  const notifications = userIds.map((userId) => ({
    user_id: userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
    is_read: false,
  }))

  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications)
    .select()

  if (error) {
    console.error('Failed to create bulk notifications:', error)
    return []
  }

  return data
}

/**
 * Notify a post author when someone replies to their post
 */
export async function notifyPostReply(
  postAuthorId: string,
  replierName: string,
  postTitle: string,
  postId: string
) {
  return createNotification({
    userId: postAuthorId,
    type: 'reply',
    title: 'New reply to your post',
    message: `${replierName} replied to "${postTitle}"`,
    link: `/forum/${postId}`,
  })
}

/**
 * Notify a user when someone likes their post or reply
 */
export async function notifyLike(
  contentAuthorId: string,
  likerName: string,
  contentType: 'post' | 'reply',
  postId: string
) {
  return createNotification({
    userId: contentAuthorId,
    type: 'like',
    title: `Someone liked your ${contentType}`,
    message: `${likerName} liked your ${contentType}`,
    link: `/forum/${postId}`,
  })
}

/**
 * Notify users about a new announcement
 */
export async function notifyAnnouncement(
  userIds: string[],
  announcementTitle: string
) {
  return createBulkNotifications(userIds, {
    type: 'announcement',
    title: 'New Announcement',
    message: announcementTitle,
    link: '/',
  })
}

/**
 * Notify users about a new event
 */
export async function notifyEvent(
  userIds: string[],
  eventTitle: string
) {
  return createBulkNotifications(userIds, {
    type: 'event',
    title: 'New Event',
    message: eventTitle,
    link: '/events',
  })
}
