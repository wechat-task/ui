import type { BotStatus } from '../types'

const statusConfig: Record<BotStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-slate-100 text-slate-600' },
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700' },
  disconnected: { label: 'Disconnected', className: 'bg-red-50 text-red-700' },
  expired: { label: 'Expired', className: 'bg-slate-100 text-slate-400' },
}

export function StatusBadge({ status }: { status: BotStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
