import { Header } from '@/components/header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Main layout is accessible to all users (authenticated and guests)
  // Individual pages like /profile and /settings handle their own auth checks
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} University Forum. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
