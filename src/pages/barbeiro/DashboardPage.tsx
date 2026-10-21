import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { PanelShell } from '../../components/layout/PanelShell'
import { Carregando, ErroCarregar, Vazio } from '../../components/ui'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { useCarregar } from '../../hooks/useCarregar'
import { financeiroApi } from '../../api/financeiro'
import type { ResumoFinanceiro } from '../../types'
import { limitesDoMes } from '../../utils/dias'
import { cap, formatCurrencyShort, toISODate } from '../../utils/formatters'

const resumoDoMes = (ref: Date) => {
  const { inicio, fim } = limitesDoMes(ref)
  return financeiroApi.resumo(toISODate(inicio), toISODate(fim))
}

/** Variação do lucro contra o mês anterior; sem base de comparação, nada. */
function variacao(atual: ResumoFinanceiro, anterior: ResumoFinanceiro) {
  if (anterior.lucro <= 0) return null
  return Math.round(((atual.lucro - anterior.lucro) / anterior.lucro) * 100)
}

export function DashboardPage() {
  const [mes, setMes] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const chave = toISODate(mes)
  const { dados, erro, carregando, recarregar } = useCarregar(
    () => Promise.all([resumoDoMes(mes), resumoDoMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))]),
    [chave],
  )

  const label = cap(mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }))
  const mudarMes = (delta: number) => setMes((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))
  const ehMesAtual = chave === toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  const atual = dados?.[0]
  const anterior = dados?.[1]
  const pct = atual && anterior ? variacao(atual, anterior) : null
  const mix = atual?.servicos ?? []
  const maxN = Math.max(...mix.map((m) => m.atendimentos), 1)
  const top = mix[0]

  const textoVariacao =
    pct === null ? null : `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct)}% vs. mês anterior`

  const isDesktop = useIsDesktop()

  const seletor = (compacto: boolean) => (
    <div
      className={`flex items-center rounded-lg border border-line bg-surface ${
        compacto ? 'gap-1.5 px-2 py-1.5' : 'justify-between px-3.5 py-2.5'
      }`}
    >
      <button
        onClick={() => mudarMes(-1)}
        aria-label="Mês anterior"
        className={`flex items-center justify-center bg-screen text-ink-2 hover:bg-line ${
          compacto ? 'h-6 w-6 rounded' : 'h-7 w-7 rounded-field'
        }`}
      >
        ‹
      </button>
      <span className={`text-center font-semibold text-ink ${compacto ? 'min-w-[130px] text-[13.5px]' : 'text-[14px]'}`}>
        {label}
      </span>
      <button
        onClick={() => mudarMes(1)}
        disabled={ehMesAtual}
        aria-label="Próximo mês"
        className={`flex items-center justify-center bg-screen text-ink-2 hover:bg-line disabled:opacity-30 ${
          compacto ? 'h-6 w-6 rounded' : 'h-7 w-7 rounded-field'
        }`}
      >
        ›
      </button>
    </div>
  )

  const listaMix = (
    <div className="flex flex-col gap-4">
      {mix.map((m) => (
        <div key={m.nome}>
          <div className="mb-1.5 flex justify-between gap-3">
            <span className="text-[13.5px] font-medium text-ink">{m.nome}</span>
            <span className="text-[13px] text-muted">
              <span className="font-semibold text-ink-2">{m.atendimentos}</span> ·{' '}
              {formatCurrencyShort(m.faturamento)}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded bg-line">
            <div
              className="h-full origin-left animate-grow rounded bg-brand"
              style={{ width: `${Math.round((m.atendimentos / maxN) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )

  const insight = top && (
    <div className="flex gap-3 rounded-card bg-brand-tint-2 px-[15px] py-3.5">
      <span className="text-base leading-tight">💡</span>
      <p className="m-0 text-[12.5px] leading-relaxed text-brand-hover">
        {top.nome} é o serviço mais realizado do mês ({top.atendimentos}{' '}
        {top.atendimentos === 1 ? 'atendimento' : 'atendimentos'}, {formatCurrencyShort(top.faturamento)}) —
        considere destacá-lo para os clientes.
      </p>
    </div>
  )

  const estado =
    carregando && !dados ? (
      <Carregando />
    ) : erro && !dados ? (
      <ErroCarregar mensagem={erro} onTentar={recarregar} />
    ) : null

  const semAtendimento = atual && atual.atendimentos === 0 && (
    <Vazio
      icone="📊"
      titulo="Nenhum atendimento concluído neste mês"
      dica="Os números aparecem quando você marca um agendamento como concluído."
    />
  )

  /* ------------------------------- Desktop (D4) ------------------------------ */
  if (isDesktop) {
    return (
      <PanelShell>
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-[26px] font-medium text-ink">Financeiro</h2>
          {seletor(true)}
        </div>

        {estado ??
          (atual && (
            <>
              <div className="mb-7 grid max-w-[760px] grid-cols-[1fr_1fr_1.3fr] gap-4">
                <div className="rounded-card border border-line bg-surface p-[18px] shadow-card">
                  <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-muted">
                    Faturamento
                  </div>
                  <div className="text-[24px] font-semibold text-ink">{formatCurrencyShort(atual.faturamento)}</div>
                  <div className="mt-1 text-[11.5px] text-muted">{atual.atendimentos} {atual.atendimentos === 1 ? 'atendimento' : 'atendimentos'}</div>
                </div>
                <div className="rounded-card border border-line bg-surface p-[18px] shadow-card">
                  <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-teal">
                    Insumos
                  </div>
                  <div className="text-[24px] font-semibold text-teal">{formatCurrencyShort(atual.custos)}</div>
                </div>
                <div className="relative overflow-hidden rounded-card bg-ink p-[18px]">
                  <div className="absolute right-6 top-0 h-[70px] w-[18px] bg-brand opacity-85 [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
                  <div className="relative mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-white/55">
                    Lucro líquido
                  </div>
                  <div className="relative text-[24px] font-semibold text-white">
                    {formatCurrencyShort(atual.lucro)}{' '}
                    {textoVariacao && (
                      <span className="text-[12px] font-semibold text-brand-ink">{textoVariacao.split(' vs.')[0]}</span>
                    )}
                  </div>
                </div>
              </div>

              {semAtendimento || (
                <>
                  <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
                    Mix de serviços
                  </div>
                  <div className="max-w-[560px]">{listaMix}</div>
                  <div className="mt-6 max-w-[560px]">{insight}</div>
                </>
              )}
            </>
          ))}
      </PanelShell>
    )
  }

  /* -------------------------------- Mobile (2.8) ----------------------------- */
  return (
    <AppShell withNav>
      <div className="flex-none px-[22px] pb-3 pt-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">Gestão</div>
        <h1 className="m-0 mb-3 mt-0.5 text-[22px] font-medium text-ink">Financeiro</h1>
        {seletor(false)}
      </div>

      <div className="flex flex-1 flex-col px-[22px] pb-5 pt-1">
        {estado ??
          (atual && (
            <>
              <div className="mb-2.5 flex gap-2.5">
                <div className="flex-1 rounded-card border border-line bg-surface p-[13px] shadow-card">
                  <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-muted">
                    Faturamento
                  </div>
                  <div className="text-[18px] font-semibold text-ink">{formatCurrencyShort(atual.faturamento)}</div>
                </div>
                <div className="flex-1 rounded-card border border-line bg-surface p-[13px] shadow-card">
                  <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-teal">
                    Insumos
                  </div>
                  <div className="text-[18px] font-semibold text-teal">{formatCurrencyShort(atual.custos)}</div>
                </div>
              </div>

              <div className="relative mb-5 overflow-hidden rounded-card bg-ink px-[18px] py-5">
                <div className="absolute right-[34px] top-0 h-[100px] w-[22px] bg-brand opacity-85 [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
                <div className="absolute right-3 top-0 h-[100px] w-[22px] bg-brand-light opacity-85 [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
                <div className="relative">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-white/55">
                    Lucro líquido
                  </div>
                  <div className="text-[36px] font-semibold leading-none text-white">
                    {formatCurrencyShort(atual.lucro)}
                  </div>
                  <div className="mt-2 text-[12.5px] font-semibold text-brand-ink">
                    {textoVariacao ?? `${atual.atendimentos} ${atual.atendimentos === 1 ? 'atendimento' : 'atendimentos'} no mês`}
                  </div>
                </div>
              </div>

              {semAtendimento || (
                <>
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
                    Mix de serviços
                  </div>
                  <div className="mb-[18px]">{listaMix}</div>
                  {insight}
                </>
              )}
            </>
          ))}
      </div>
    </AppShell>
  )
}
