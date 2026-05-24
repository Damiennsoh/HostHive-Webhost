'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MetricsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: string
    positive: boolean
  }
}

export function MetricsCard({ title, value, subtitle, icon, trend }: MetricsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <span className="text-3xl font-semibold text-foreground">{value}</span>
        {subtitle && (
          <span className="ml-2 text-sm text-muted-foreground">{subtitle}</span>
        )}
      </div>
      {trend && (
        <div className="mt-2">
          <span
            className={cn(
              'text-sm',
              trend.positive ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {trend.positive ? '+' : ''}{trend.value}
          </span>
          <span className="ml-1 text-sm text-muted-foreground">from last month</span>
        </div>
      )}
    </motion.div>
  )
}
