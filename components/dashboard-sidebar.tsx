'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Folder,
  Rocket,
  Settings,
  Key,
  Building2,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: Folder },
  { href: '/deployments', label: 'Deployments', icon: Rocket },
  { href: '/domains', label: 'Domains', icon: Globe },
  { href: '/organizations', label: 'Organizations', icon: Building2 },
  { href: '/api-keys', label: 'API Keys', icon: Key },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <span className="text-sm font-bold text-black">N</span>
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">NexusCloud</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-sidebar-foreground'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 rounded-md bg-sidebar-accent"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-md bg-sidebar-accent p-4">
            <p className="text-sm font-medium text-sidebar-foreground">Pro Plan</p>
            <p className="mt-1 text-xs text-sidebar-foreground/60">
              Unlimited deployments
            </p>
            <Link
              href="/settings?tab=billing"
              className="mt-3 inline-block text-xs font-medium text-white hover:underline"
            >
              Manage subscription
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
