import type { StatusAgendamento } from '../../types'
import { statusConfig } from '../../utils/status'

interface BadgeProps {
  status: StatusAgendamento
  className?: string
}

/** Etiqueta de status do agendamento, com cor por status. */
export function Badge({ status, className = '' }: BadgeProps) {
  const cfg = statusConfig[status]
  return (
    <span
      className={`inline-block rounded-lg px-2 py-[3px] text-[10px] font-bold tracking-[0.2px] ${cfg.badge} ${className}`}
    >
      {cfg.label}
    </span>
  )
}
