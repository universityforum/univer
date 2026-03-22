import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  GraduationCap, 
  Users, 
  MessageSquare, 
  Search,
  Mail,
  Building2,
  Star,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Mentors | University Forum',
  description: 'Connect with experienced mentors who can guide you through your academic journey.',
}

export default async function MentorsPage() {
  const supabase = await createClient()
  
  // Get mentors (teachers and senior students who opted in as mentors)
  const { data: mentors } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['teacher', 'admin'])
    .order('full_name', { ascending: true })

  const getInitials = (name: string | null) => {
    if (!name) return 'M'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const departmentColors: Record<string, string> = {
    'Computer Science': 'bg-blue-100 text-blue-700',
    'Engineering': 'bg-orange-100 text-orange-700',
    'Business': 'bg-green-100 text-green-700',
    'Medicine': 'bg-red-100 text-red-700',
    'Law': 'bg-purple-100 text-purple-700',
    'Arts': 'bg-pink-100 text-pink-700',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4 bg-secondary/10 text-secondary">
          Mentorship Program
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
          Connect with Experienced Mentors
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Get guidance from professors, senior students, and industry professionals 
          who are here to help you succeed in your academic journey.
        </p>
        
        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search mentors by name or department..." 
            className="pl-10 rounded-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{(mentors?.length || 0) + 25}</div>
            <div className="text-sm text-muted-foreground">Active Mentors</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <GraduationCap className="h-5 w-5 text-secondary" />
            </div>
            <div className="text-2xl font-bold">150+</div>
            <div className="text-sm text-muted-foreground">Students Helped</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="text-2xl font-bold">500+</div>
            <div className="text-sm text-muted-foreground">Sessions Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="mb-12 bg-muted/30">
        <CardHeader className="text-center">
          <CardTitle>How Mentorship Works</CardTitle>
          <CardDescription>Three simple steps to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">1</div>
              <h3 className="font-semibold mb-2">Find a Mentor</h3>
              <p className="text-sm text-muted-foreground">Browse our list of experienced mentors and find one that matches your field of study.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">2</div>
              <h3 className="font-semibold mb-2">Send a Message</h3>
              <p className="text-sm text-muted-foreground">Reach out to introduce yourself and explain what guidance you are looking for.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">3</div>
              <h3 className="font-semibold mb-2">Start Learning</h3>
              <p className="text-sm text-muted-foreground">Schedule regular sessions and get personalized advice for your academic journey.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentors Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Available Mentors</h2>
        
        {mentors && mentors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={mentor.avatar_url || undefined} alt={mentor.full_name || 'Mentor'} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(mentor.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {mentor.full_name || 'Mentor'}
                      </h3>
                      <Badge variant="secondary" className="capitalize text-xs mt-1">
                        {mentor.role}
                      </Badge>
                      {mentor.department && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                          <Building2 className="h-3 w-3" />
                          {mentor.department}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {mentor.bio && (
                    <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                      {mentor.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" className="flex-1 rounded-lg" asChild>
                      <Link href={`mailto:${mentor.email}`}>
                        <Mail className="h-4 w-4 mr-1" />
                        Contact
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-lg">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Mentors Available Yet</h3>
              <p className="text-muted-foreground mb-4">
                Check back soon as more mentors join our platform.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* CTA */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="py-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Become a Mentor</h2>
          <p className="text-primary-foreground/80 mb-4 max-w-lg mx-auto">
            Share your knowledge and help fellow students succeed. 
            Join our mentorship program and make a difference.
          </p>
          <Button variant="secondary" className="rounded-full" asChild>
            <Link href="/profile">
              Apply to Become a Mentor
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
