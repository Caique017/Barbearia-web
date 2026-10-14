import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { Button } from '../../components/ui'
import { mockHistorico, mockProximo, servicoIcon } from '../../data/mock'
import { formatCurrencyShort } from '../../utils/formatters'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "Ter, 15 jul" — data curta dos cards de histórico. */
const dataCurta = (iso: string) => {
  const d = new Date(iso)
  const dow = cap(d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''))
  const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  return `${dow}, ${d.getDate()} ${mes}`
}

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export function HistoricoPage() {
  const navigate = useNavigate()

  // TODO: integrar com API — GET /cliente/historico
  const historico = mockHistorico
  const proximo = mockProximo

  const { totalCortes, totalGasto } = useMemo(
    () => ({
      totalCortes: historico.length,
      totalGasto: historico.reduce((acc, a) => acc + a.servico.preco, 0),
    }),
    [historico],
  )

  return (
    <AppShell className="bg-screen">
      <Header />

      <div className="flex flex-1 flex-col gap-4 px-[22px] pb-4 pt-1">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
            Seu histórico
          </div>
          <h1 className="m-0 mt-1 text-[24px] font-medium leading-tight text-ink">
            Olá, {proximo.cliente.nome} 👋
          </h1>
        </div>

        {/* Resumo — total de cortes + total gasto */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-card border border-line bg-surface p-4 shadow-card">
            <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-muted">
              Cortes
            </div>
            <div className="mt-1.5 text-[28px] font-semibold leading-none text-ink">
              {totalCortes}
            </div>
            <div className="mt-1 text-[12px] text-muted-2">no total</div>
          </div>
          <div className="rounded-card border border-line bg-surface p-4 shadow-card">
            <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-muted">
              Investido
            </div>
            <div className="mt-1.5 text-[28px] font-semibold leading-none text-ink">
              {formatCurrencyShort(totalGasto)}
            </div>
            <div className="mt-1 text-[12px] text-muted-2">em cuidados</div>
          </div>
        </div>

        {/* Próximo agendamento */}
        {proximo && (
          <div className="relative overflow-hidden rounded-card bg-ink p-[18px] text-white shadow-card">
            <div className="absolute -right-4 -top-6 h-[110px] w-[26px] rotate-[18deg] bg-brand opacity-40" />
            <div className="absolute right-4 -top-6 h-[110px] w-[26px] rotate-[18deg] bg-brand-light opacity-40" />
            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.6px] text-brand-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-light" />
                Próximo horário
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-white/10 text-2xl">
                  {servicoIcon(proximo.servico.id)}
                </div>
                <div className="flex-1">
                  <div className="text-[17px] font-semibold">{proximo.servico.nome}</div>
                  <div className="mt-0.5 text-[13px] text-white/60">
                    {dataCurta(proximo.dataHora)} · {hora(proximo.dataHora)}
                  </div>
                </div>
                <span className="text-[18px] font-semibold">
                  {formatCurrencyShort(proximo.servico.preco)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Cortes anteriores */}
        <div>
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
            Cortes anteriores
          </div>
          <div className="flex flex-col gap-2.5">
            {historico.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 shadow-card"
              >
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-screen text-xl">
                  {servicoIcon(a.servico.id)}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-ink">{a.servico.nome}</div>
                  <div className="mt-0.5 text-[12.5px] text-muted">{dataCurta(a.dataHora)}</div>
                </div>
                <span className="text-[15px] font-semibold text-ink">
                  {formatCurrencyShort(a.servico.preco)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3.5 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
        <Button className="w-full" onClick={() => navigate('/cliente/agendar')}>
          Marcar novo horário
        </Button>
      </div>
    </AppShell>
  )
}
