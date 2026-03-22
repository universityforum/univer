'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { Profile } from '@/lib/types'

interface SettingsFormProps {
  profile: Profile | null
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Notification preferences state
  const [emailReplies, setEmailReplies] = useState(true)
  const [emailLikes, setEmailLikes] = useState(false)
  const [emailMentions, setEmailMentions] = useState(true)
  const [emailAnnouncements, setEmailAnnouncements] = useState(true)
  const [emailEvents, setEmailEvents] = useState(true)

  const handleSave = async () => {
    setLoading(true)
    // Simulate saving - in production, this would save to database
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-replies" className="font-medium">Replies</Label>
            <p className="text-sm text-muted-foreground">Get notified when someone replies to your posts</p>
          </div>
          <Switch 
            id="email-replies" 
            checked={emailReplies}
            onCheckedChange={setEmailReplies}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-likes" className="font-medium">Likes</Label>
            <p className="text-sm text-muted-foreground">Get notified when someone likes your content</p>
          </div>
          <Switch 
            id="email-likes" 
            checked={emailLikes}
            onCheckedChange={setEmailLikes}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-mentions" className="font-medium">Mentions</Label>
            <p className="text-sm text-muted-foreground">Get notified when someone mentions you</p>
          </div>
          <Switch 
            id="email-mentions" 
            checked={emailMentions}
            onCheckedChange={setEmailMentions}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-announcements" className="font-medium">Announcements</Label>
            <p className="text-sm text-muted-foreground">Important updates from administrators</p>
          </div>
          <Switch 
            id="email-announcements" 
            checked={emailAnnouncements}
            onCheckedChange={setEmailAnnouncements}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-events" className="font-medium">Events</Label>
            <p className="text-sm text-muted-foreground">Notifications about upcoming events</p>
          </div>
          <Switch 
            id="email-events" 
            checked={emailEvents}
            onCheckedChange={setEmailEvents}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Spinner className="h-4 w-4 mr-2" />}
          Save Preferences
        </Button>
        {saved && (
          <span className="text-sm text-secondary">Settings saved successfully!</span>
        )}
      </div>
    </div>
  )
}
