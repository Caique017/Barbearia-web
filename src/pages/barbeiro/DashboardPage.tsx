import { useMemo, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { PanelShell } from '../../components/layout/PanelShell'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { mockDashboard } from '../../data/mock'
import { formatCurrencyShort } from '../../utils/formatters'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function DashboardPage() {
  const [mes, setMes] = useState(() => new Date(2026, 6, 1)) // Julho 2026 (como no design)
  // TODO: integrar com API — GET /barbeiro/dashboard?mes=MM&ano=YYYY
  const dados = mockDashboard

  const label = cap(mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }))
  const mudarMes = (delta: number) => setMes((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))

  const maxN = useMemo(
    () => Math.max(...dados.mixServicos.map((m) => m.quantidade), 1),
    [dados.mixServicos],
  )
  const topServico = useMemo(
    () => [...dados.mixServicos].sort((a, b) => b.quantidade - a.quantidade)[0],
    [dados.mixServicos],
  )

  const isDesktop = useIsDesktop()

  /* ------------------------------- Desktop (D4) ------------------------------ */
  if (isDesktop) {
    return (
      <PanelShell>
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-[26px] font-medium text-ink">Financeiro</h2>
          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1.5">
            <button
              onClick={() => mudarMes(-1)}
              aria-label="Mês anterior"
              className="flex h-6 w-6 items-center justify-center rounded bg-screen text-ink-2 hover:bg-line"
            >
              ‹
            </button>
            <span className="min-w-[110px] text-center text-[13.5px] font-semibold text-ink">
              {label}
            </span>
            <button
              onClick={() => mudarMes(1)}
              aria-label="Próximo mês"
              className="flex h-6 w-6 items-center justify-center rounded bg-screen text-ink-2 hover:bg-line"
            >
              ›
            </button>
          </div>
        </div>

        <div className="mb-7 grid max-w-[760px] grid-cols-[1fr_1fr_1.3fr] gap-4">
          <div className="rounded-card border border-line bg-surface p-[18px] shadow-card">
            <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-muted">
              Faturamento
            </div>
            <div className="text-[24px] font-semibold text-ink">
              {formatCurrencyShort(dados.faturamentoBruto)}
            </div>
          </div>
          <div className="rounded-card border border-line bg-surface p-[18px] shadow-card">
            <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-teal">
              Insumos
            </div>
            <div className="text-[24px] font-semibold text-teal">
              {formatCurrencyShort(dados.gastoInsumos)}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-card bg-ink p-[18px]">
            <div className="absolute right-6 top-0 h-[70px] w-[18px] bg-brand opacity-85 [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
            <div className="relative mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-white/55">
              Lucro líquido
            </div>
            <div className="relative text-[24px] font-semibold text-white">
              {formatCurrencyShort(dados.lucroLiquido)}{' '}
              <span className="text-[12px] font-semibold text-brand-ink">▲12%</span>
            </div>
          </div>
        </div>

        <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
          Mix de serviços
        </div>
        <div className="flex max-w-[560px] flex-col gap-4">
          {dados.mixServicos.map((m) => (
            <div key={m.nome}>
              <div className="mb-1.5 flex justify-between">
                <span className="text-[13.5px] font-medium text-ink">{m.nome}</span>
                <span className="text-[13.5px] font-semibold text-muted">{m.quantidade}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded bg-line">
                <div
                  className="h-full origin-left animate-grow rounded bg-brand"
                  style={{ width: `${Math.round((m.quantidade / maxN) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex max-w-[560px] gap-3 rounded-card bg-brand-tint-2 px-[15px] py-3.5">
          <span className="text-base leading-tight">💡</span>
          <p className="m-0 text-[12.5px] leading-relaxed text-brand-hover">
            {topServico.nome} é o serviço mais realizado do mês ({topServico.quantidade}{' '}
            atendimentos) — considere destacá-lo para os clientes.
          </p>
        </div>
      </PanelShell>
    )
  }

  /* -------------------------------- Mobile (2.8) ----------------------------- */
  return (
    <AppShell withNav>
      <div className="flex-none px-[22px] pb-3 pt-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">Gestão</div>
        <h1 className="m-0 mb-3 mt-0.5 text-[22px] font-medium text-ink">Financeiro</h1>
        <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-2.5">
          <button
            onClick={() => mudarMes(-1)}
            aria-label="Mês anterior"
            className="flex h-7 w-7 items-center justify-center rounded-field bg-screen text-ink-2 hover:bg-line"
          >
            ‹
          </button>
          <span className="text-[14px] font-semibold text-ink">{label}</span>
          <button
            onClick={() => mudarMes(1)}
            aria-label="Próximo mês"
            className="flex h-7 w-7 items-center justify-center rounded-field bg-screen text-ink-2 hover:bg-line"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-[22px] pb-5 pt-1">
        {/* Faturamento + Insumos */}
        <div className="mb-2.5 flex gap-2.5">
          <div className="flex-1 rounded-card border border-line bg-surface p-[13px] shadow-card">
            <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-muted">
              Faturamento
            </div>
            <div className="text-[18px] font-semibold text-ink">
              {formatCurrencyShort(dados.faturamentoBruto)}
            </div>
          </div>
          <div className="flex-1 rounded-card border border-line bg-surface p-[13px] shadow-card">
            <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-teal">
              Insumos
            </div>
            <div className="text-[18px] font-semibold text-teal">
              {formatCurrencyShort(dados.gastoInsumos)}
            </div>
          </div>
        </div>

        {/* Lucro líquido */}
        <div className="relative mb-5 overflow-hidden rounded-card bg-ink px-[18px] py-5">
          <div className="absolute right-[34px] top-0 h-[100px] w-[22px] bg-brand opacity-85 [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
          <div className="absolute right-3 top-0 h-[100px] w-[22px] bg-brand-light opacity-85 [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
          <div className="relative">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-white/55">
              Lucro líquido
            </div>
            <div className="text-[36px] font-semibold leading-none text-white">
              {formatCurrencyShort(dados.lucroLiquido)}
            </div>
            <div className="mt-2 text-[12.5px] font-semibold text-brand-ink">▲ 12% vs. mês anterior</div>
          </div>
        </div>

        {/* Mix de serviços */}
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
          Mix de serviços
        </div>
        <div className="mb-[18px] flex flex-col gap-3.5">
          {dados.mixServicos.map((m) => (
            <div key={m.nome}>
              <div className="mb-1.5 flex justify-between">
                <span className="text-[13px] font-medium text-ink">{m.nome}</span>
                <span className="text-[13px] font-semibold text-muted">{m.quantidade}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded bg-line">
                <div
                  className="h-full origin-left animate-grow rounded bg-brand"
                  style={{ width: `${Math.round((m.quantidade / maxN) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Insight automático */}
        <div className="flex gap-3 rounded-card bg-brand-tint-2 px-[15px] py-3.5">
          <span className="text-base leading-tight">💡</span>
          <p className="m-0 text-[12.5px] leading-relaxed text-brand-hover">
            {topServico.nome} é o serviço mais realizado do mês ({topServico.quantidade}{' '}
            atendimentos) — considere destacá-lo para os clientes.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
