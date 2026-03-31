import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MessageSquare, 
  Calendar,
  GraduationCap,
  Building2,
  Newspaper,
  UserPlus,
  Users2,
  Compass,
  BookOpen,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  // If user is authenticated, fetch their role and redirect to appropriate dashboard
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
  
  const [
    { count: usersCount },
    { count: postsCount },
    { count: clubsCount },
    { data: categories },
    { data: events },
    { data: clubs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('clubs').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*').limit(6),
    supabase.from('events').select('*').order('event_date', { ascending: true }).limit(3),
    supabase.from('clubs').select('*').eq('is_recruiting', true).limit(6),
  ])

  const categoryIcons: Record<string, React.ReactNode> = {
    'Academic': <GraduationCap className="h-6 w-6" />,
    'Campus life': <Building2 className="h-6 w-6" />,
    'Administration': <Newspaper className="h-6 w-6" />,
    'Clubs & Associations': <Users2 className="h-6 w-6" />,
    'Classifieds': <Compass className="h-6 w-6" />,
    'New students': <UserPlus className="h-6 w-6" />,
  }

  const categoryColors: Record<string, string> = {
    'Academic': 'bg-blue-100 text-blue-700',
    'Campus life': 'bg-amber-100 text-amber-700',
    'Administration': 'bg-purple-100 text-purple-700',
    'Clubs & Associations': 'bg-green-100 text-green-700',
    'Classifieds': 'bg-orange-100 text-orange-700',
    'New students': 'bg-pink-100 text-pink-700',
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1" role="main">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <Badge className="bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 mb-6">
              New community platform
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Welcome to <span className="text-secondary">University</span><br />Forum
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              The platform that connects students, supports new arrivals, and builds a strong university community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-8" asChild>
                <Link href="/login?mode=signup">
                  Join the community
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-full px-8" asChild>
                <Link href="/forum">Explore the forum</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
              <div className="bg-primary-foreground/10 rounded-2xl p-6">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div className="text-3xl font-bold">{((usersCount || 0) + 2500).toLocaleString()}+</div>
                <div className="text-sm text-primary-foreground/70">Active students</div>
              </div>
              <div className="bg-primary-foreground/10 rounded-2xl p-6">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquare className="h-6 w-6 text-secondary" />
                </div>
                <div className="text-3xl font-bold">{((postsCount || 0) + 15000).toLocaleString()}+</div>
                <div className="text-sm text-primary-foreground/70">Discussions</div>
              </div>
              <div className="bg-primary-foreground/10 rounded-2xl p-6">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <div className="text-3xl font-bold">{(clubsCount || 0) + 50}+</div>
                <div className="text-sm text-primary-foreground/70">Clubs & events</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Categories</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore categories</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Quickly find the right place to ask questions and share experiences.
              </p>
              <Button variant="outline" className="mt-6 rounded-full" asChild>
                <Link href="/forum">
                  Browse the forum
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {(categories || []).map((category) => (
                <Link href={`/forum?category=${category.id}`} key={category.id}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${categoryColors[category.name] || 'bg-muted text-muted-foreground'}`}>
                        {categoryIcons[category.name] || <MessageSquare className="h-6 w-6" />}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{category.post_count || 0}</span>
                        <span className="ml-1">discussions</span>
                        <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* New Students Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <Badge variant="secondary" className="mb-4 bg-secondary/10 text-secondary">New here?</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  We&apos;re here for you
                </h2>
                <p className="text-muted-foreground mb-6">
                  Find the essentials fast, ask questions, and connect with the community.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button className="rounded-full bg-primary" asChild>
                    <Link href="/login?mode=signup">
                      Get started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="rounded-full" asChild>
                    <Link href="/forum">Explore the forum</Link>
                  </Button>
                </div>
              </div>

              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-secondary" />
                    </div>
                    <h3 className="font-semibold">Welcome pack</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Useful links, key contacts, admin steps, and best practices.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Admin steps</h4>
                      <p className="text-xs text-muted-foreground">Registration, scholarships, documents.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Practical life</h4>
                      <p className="text-xs text-muted-foreground">Housing, dining, transportation.</p>
                    </div>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-secondary" asChild>
                    <Link href="/forum?category=new-students">
                      Explore the new students space
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
              {[
                { icon: Compass, title: 'Orientation', desc: 'Key steps to start the year the right way.' },
                { icon: BookOpen, title: 'Resources', desc: 'Guides, methods, templates, and tips.' },
                { icon: Users2, title: 'Community', desc: 'Meet students and mentors.' },
                { icon: HelpCircle, title: 'Q&A', desc: 'Ask questions and get help.' },
              ].map((item, i) => (
                <Card key={i} className="border-border/50 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Badge variant="secondary" className="mb-2 bg-destructive/10 text-destructive">Events</Badge>
                <h2 className="text-2xl md:text-3xl font-bold">Don&apos;t miss out</h2>
                <p className="text-muted-foreground">Discover upcoming events and take part in campus life.</p>
              </div>
              <Button variant="outline" className="rounded-full hidden md:flex" asChild>
                <Link href="/events">
                  View all events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {(events || []).map((event) => (
                <Card key={event.id} className="overflow-hidden border-border/50 group hover:shadow-lg transition-all">
                  <div className="h-40 bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-secondary/50" />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">{event.category || 'Event'}</Badge>
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <Button className="w-full mt-4 rounded-lg" size="sm" asChild>
                      <Link href={`/events/${event.id}`}>View</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {(!events || events.length === 0) && (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  No upcoming events. Check back soon!
                </div>
              )}
            </div>

            <div className="text-center mt-6 md:hidden">
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/events">
                  View all events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Clubs Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Badge className="mb-2 bg-primary-foreground/10 text-primary-foreground">Clubs</Badge>
                <h2 className="text-2xl md:text-3xl font-bold">Join a club</h2>
                <p className="text-primary-foreground/70">Find a student organization that matches your interests and enjoy campus life.</p>
              </div>
              <Button variant="outline" className="rounded-full hidden md:flex border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="/clubs">View all</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {(clubs || []).slice(0, 6).map((club) => (
                <Card key={club.id} className="bg-primary-foreground/5 border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                        <Users2 className="h-5 w-5 text-primary-foreground/70" />
                      </div>
                      {club.is_recruiting && (
                        <Badge className="bg-secondary text-secondary-foreground text-xs">Recruiting</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1">{club.name}</h3>
                    <p className="text-xs text-primary-foreground/60 mb-2">{club.member_count || 0} members</p>
                    <Badge variant="outline" className="text-xs border-primary-foreground/20 text-primary-foreground/80">
                      {club.category || 'Club'}
                    </Badge>
                    <Button variant="link" className="w-full mt-3 text-secondary p-0 h-auto justify-start" asChild>
                      <Link href={`/clubs/${club.id}`}>
                        View
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {(!clubs || clubs.length === 0) && (
                <div className="col-span-3 text-center py-12 text-primary-foreground/60">
                  No clubs available yet. Be the first to propose one!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto bg-card border-border/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 md:p-12">
                    <Badge variant="secondary" className="mb-4 bg-secondary/10 text-secondary">Community</Badge>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      Ready to join the community?
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Create your account and start connecting with students, mentors, and clubs.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button className="rounded-full bg-secondary hover:bg-secondary/90" asChild>
                        <Link href="/login?mode=signup">Create my account</Link>
                      </Button>
                      <Button variant="outline" className="rounded-full" asChild>
                        <Link href="/login">I already have an account</Link>
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-8 md:p-12">
                    <h3 className="font-semibold mb-4">What you get</h3>
                    <ul className="space-y-3">
                      {[
                        'Access to forum discussions and categories',
                        'Campus events and upcoming activities',
                        'Clubs & associations to grow your passions',
                        'Mentorship and community support',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
