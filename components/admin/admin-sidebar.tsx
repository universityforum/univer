'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  MessageSquare,
  Calendar,
  Users2,
  Megaphone,
  Shield,
} from 'lucide-react'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/posts', label: 'Discussions', icon: MessageSquare },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/clubs', label: 'Clubs', icon: Users2 },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <Link href="/admin" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-sidebar-primary" aria-hidden="true" />
          <span className="font-bold">Admin Panel</span>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1" aria-label="Admin navigation">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="University Forum" width={120} height={40} className="h-8 w-auto opacity-70" />
        </Link>
      </div>
    </aside>
  )
}
