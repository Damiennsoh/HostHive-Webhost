'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Settings, LogOut, CreditCard, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User as UserType } from '@/lib/types'

interface UserMenuProps {
  user: UserType
  onLogout: () => void
}

const planLabels: Record<NonNullable<UserType['plan']>, string> = {
  free: 'Free',
  startup: 'Startup',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const plan = user.plan ?? 'free'

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-foreground leading-none">{user.username}</p>
            <Badge variant="outline" className="mt-1 h-5 border-primary/30 text-[10px] text-primary">
              {planLabels[plan]}
            </Badge>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-foreground">{user.username}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <Badge className="mt-2 bg-primary/10 text-primary border-primary/20" variant="outline">
            {planLabels[plan]} plan
          </Badge>
        </div>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/settings?tab=billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={() => {
            onLogout()
            setOpen(false)
          }}
          className="cursor-pointer text-red-400 focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
