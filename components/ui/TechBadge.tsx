import clsx from 'clsx'
import type { TechTag } from '@/data/projects'

const colorMap: Record<NonNullable<TechTag['color']>, string> = {
  cyan: 'bg-accent-dim text-accent border-accent/20',
  purple: 'bg-purple-dim text-purple border-purple/20',
  green: 'bg-emerald-950/40 text-emerald-400 border-emerald-400/20',
  orange: 'bg-orange-950/40 text-orange-400 border-orange-400/20',
  default: 'bg-surface-2 text-text-secondary border-border',
}

type Props = {
  label: string
  color?: TechTag['color']
  size?: 'sm' | 'md'
}

export default function TechBadge({ label, color = 'default', size = 'sm' }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-mono border rounded-md leading-none',
        colorMap[color],
        size === 'sm' ? 'text-[11px] px-2 py-1' : 'text-xs px-2.5 py-1.5'
      )}
    >
      {label}
    </span>
  )
}
