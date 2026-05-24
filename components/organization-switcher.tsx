'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Organization } from '@/lib/types'
import { cn } from '@/lib/utils'

interface OrganizationSwitcherProps {
  organizations: Organization[]
  currentOrganization: Organization | null
  onSwitch: (orgId: string) => void
}

export function OrganizationSwitcher({
  organizations,
  currentOrganization,
  onSwitch,
}: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-auto items-center gap-2 px-2 py-1.5 text-foreground hover:bg-muted"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium text-foreground">
            {currentOrganization?.name.charAt(0) || 'P'}
          </div>
          <span className="text-sm font-medium">
            {currentOrganization?.name || 'Personal'}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-card border-border">
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => {
              onSwitch(org.id)
              setOpen(false)
            }}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              currentOrganization?.id === org.id && "bg-muted"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">
                {org.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{org.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{org.plan}</p>
              </div>
            </div>
            {currentOrganization?.id === org.id && (
              <Check className="h-4 w-4 text-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
