import type { StatusAgendamento } from '../types'

/** Aparência de cada status — cores extraídas do design. */
export const statusConfig: Record<
  StatusAgendamento,
  { label: string; badge: string; bar: string }
> = {
  CONFIRMADO: { label: 'Confirmado', badge: 'bg-brand-tint-2 text-brand-hover', bar: 'border-l-brand' },
  CONCLUIDO: { label: 'Concluído', badge: 'bg-line text-muted', bar: 'border-l-muted-2' },
  CANCELADO: { label: 'Cancelado', badge: 'bg-danger-tint text-danger', bar: 'border-l-danger' },
  NO_SHOW: { label: 'Faltou', badge: 'bg-[#ffe6cf] text-[#b45309]', bar: 'border-l-[#e8873a]' },
  REMARCADO: { label: 'Remarcado', badge: 'bg-brand-tint text-brand', bar: 'border-l-brand-light' },
}
