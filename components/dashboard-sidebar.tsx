'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Folder,
  Rocket,
  Settings,
  Globe,
  Github,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/brand'

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: Folder },
  { href: '/deployments', label: 'Deployments', icon: Rocket },
  { href: '/domains', label: 'Domains', icon: Globe },
  { href: '/databases', label: 'Databases', icon: Database },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">{APP_NAME}</span>
          </Link>
        </div>

        <div className="p-4">
          <Link href="/projects/new">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Rocket className="mr-2 h-4 w-4" />
              Deploy
            </Button>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground ring-1 ring-primary/30'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                  />
                )}
                <Icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Github className="h-4 w-4" />
            GitHub
            <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" title="Connect in Settings" />
          </a>
        </div>
      </div>
    </aside>
  )
}
