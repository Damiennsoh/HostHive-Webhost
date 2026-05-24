'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bell, Menu, X, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OrganizationSwitcher } from './organization-switcher'
import { UserMenu } from './user-menu'
import { useAuth } from '@/lib/auth-context'
import { mockNotifications } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Folder,
  Rocket,
  Settings,
  Key,
  Building2,
  Globe,
} from 'lucide-react'

const mobileLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: Folder },
  { href: '/deployments', label: 'Deployments', icon: Rocket },
  { href: '/domains', label: 'Domains', icon: Globe },
  { href: '/organizations', label: 'Organizations', icon: Building2 },
  { href: '/api-keys', label: 'API Keys', icon: Key },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function DashboardHeader() {
  const pathname = usePathname()
  const { user, organization, organizations, logout, switchOrganization } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const unreadCount = mockNotifications.filter(n => !n.read).length

  if (!user) return null

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>

            {/* Mobile logo */}
            <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <span className="text-sm font-bold text-black">H</span>
              </div>
            </Link>

            {/* Organization switcher */}
            <div className="hidden lg:block">
              <OrganizationSwitcher
                organizations={organizations}
                currentOrganization={organization}
                onSwitch={switchOrganization}
              />
            </div>

            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-64 bg-muted border-transparent pl-9 pr-12 text-sm placeholder:text-muted-foreground focus:border-border focus:bg-background"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <kbd className="flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
                    <Command className="h-3 w-3" />K
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-medium text-black">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border-border">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground">Notifications</p>
                </div>
                {mockNotifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
                    <p className="text-sm font-medium text-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <UserMenu user={user} onLogout={logout} />
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-background lg:hidden">
          <nav className="space-y-1 p-4">
            <div className="mb-4">
              <OrganizationSwitcher
                organizations={organizations}
                currentOrganization={organization}
                onSwitch={switchOrganization}
              />
            </div>
            {mobileLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
              const Icon = link.icon

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </>
  )
}
