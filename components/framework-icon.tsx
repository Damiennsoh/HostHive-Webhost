import { Framework } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FrameworkIconProps {
  framework: Framework
  className?: string
}

export function FrameworkIcon({ framework, className }: FrameworkIconProps) {
  const iconMap: Record<Framework, string> = {
    nextjs: 'N',
    react: 'R',
    vue: 'V',
    nuxt: 'Nx',
    svelte: 'S',
    nodejs: 'JS',
    express: 'Ex',
    nestjs: 'Ns',
    python: 'Py',
    django: 'Dj',
    flask: 'Fl',
    go: 'Go',
    docker: 'D',
    static: 'St',
  }

  return (
    <span className={cn('font-mono text-xs font-bold text-muted-foreground', className)}>
      {iconMap[framework]}
    </span>
  )
}
