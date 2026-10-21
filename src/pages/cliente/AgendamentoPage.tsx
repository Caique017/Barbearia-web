import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Logo } from '../../components/layout/Logo'
import { Button, Carregando, ErroCarregar, Spinner } from '../../components/ui'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { useAuth } from '../../hooks/useAuth'
import { useCarregar } from '../../hooks/useCarregar'
import { clienteApi } from '../../api/cliente'
import { servicoApi } from '../../api/servico'
import { agendaApi } from '../../api/agenda'
import { apiErrorMessage } from '../../api/axios'
import type { ServicoPublico } from '../../types'
import { proximosDias } from '../../utils/dias'
import { servicoIcon } from '../../utils/servico'
import { dataCurta, formatCurrencyShort, horaCurta, initials, toISODate, toLocalDateTime } from '../../utils/formatters'

/** Link "Adicionar ao Google Agenda" montado a partir do dia e horário escolhidos. */
function googleCalendarLink(dia: Date, slot: string, titulo: string, minutos: number) {
  const [h, m] = slot.split(':').map(Number)
  const start = new Date(dia)
  start.setHours(h, m, 0, 0)
  const end = new Date(start.getTime() + minutos * 60_000)
  const stamp = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(
      d.getHours(),
    ).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `ClipBook · ${titulo}`,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: 'Agendamento feito pelo ClipBook.',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const CheckCircle = ({ on }: { on: boolean }) => (
  <div
    className={`flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border-[1.5px] ${
      on ? 'border-brand bg-brand' : 'border-input-border bg-transparent'
    }`}
  >
    {on && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6.2l2.3 2.3L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </div>
)

export function AgendamentoPage() {
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()
  const dias = useMemo(() => proximosDias(14), [])

  const base = useCarregar(async () => {
    const barbearia = await clienteApi.minhaBarbearia()
    const servicos = await servicoApi.publicos(barbearia.slug)
    return { barbearia, servicos }
  })
  const barbearia = base.dados?.barbearia ?? null
  const servicos: ServicoPublico[] = base.dados?.servicos ?? []

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [servicoSel, setServicoSel] = useState<string | null>(null)
  const [diaSel, setDiaSel] = useState(0)
  const [slotSel, setSlotSel] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const servico = servicos.find((s) => s.id === servicoSel) ?? null
  const dia = dias[diaSel]
  const horarios = useCarregar(
    () =>
      barbearia && servicoSel
        ? agendaApi
            .disponibilidade(barbearia.slug, servicoSel, toISODate(dia))
            .then((d) => d.horarios.map(horaCurta))
        : Promise.resolve<string[]>([]),
    [barbearia?.slug, servicoSel, toISODate(dia)],
  )
  const dataLabel = dataCurta(dia)

  const confirmar = async () => {
    if (!servico || !slotSel) return
    setEnviando(true)
    setErro(null)
    try {
      await clienteApi.agendar({ servicoId: servico.id, dataHora: toLocalDateTime(dia, slotSel) })
      setStep(4)
    } catch (e) {
      // Horário tomado no meio do caminho: volta para a grade, já atualizada.
      setErro(apiErrorMessage(e))
      setSlotSel(null)
      setStep(2)
      horarios.recarregar()
    } finally {
      setEnviando(false)
    }
  }

  const isDesktop = useIsDesktop()

  /* ------------------------ Carregando, vínculo pendente ----------------------- */
  if (!base.dados) {
    return (
      <AppShell className="bg-screen">
        {base.carregando ? (
          <Carregando />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-2xl">⏳</div>
            <ErroCarregar mensagem={base.erro ?? 'Não foi possível carregar.'} onTentar={base.recarregar} />
            <button onClick={logout} className="text-[13px] font-semibold text-brand">
              Sair
            </button>
          </div>
        )}
      </AppShell>
    )
  }

  const listaServicos = (
    <div className="flex flex-col gap-2.5">
      {servicos.length === 0 && (
        <p className="text-[13.5px] text-muted">A barbearia ainda não cadastrou serviços para agendar online.</p>
      )}
      {servicos.map((s) => {
        const on = servicoSel === s.id
        return (
          <button
            key={s.id}
            onClick={() => {
              setServicoSel(s.id)
              setSlotSel(null)
            }}
            className={`flex items-center gap-3 rounded-card border-[1.5px] p-4 text-left transition-colors ${
              on ? 'border-brand bg-brand-tint shadow-card' : 'border-line bg-surface shadow-card'
            }`}
          >
            <div
              className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg text-xl ${
                on ? 'bg-brand-tint-2' : 'bg-screen'
              }`}
            >
              {servicoIcon(s.nome)}
            </div>
            <div className="flex-1">
              <span className="text-[16px] font-semibold text-ink">{s.nome}</span>
              <div className="mt-1 text-[11.5px] font-medium text-muted-2">{s.duracaoMinutos} min</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-[17px] font-semibold text-ink">{formatCurrencyShort(s.preco)}</span>
              <CheckCircle on={on} />
            </div>
          </button>
        )
      })}
    </div>
  )

  const seletorDia = (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1.5">
      {dias.map((d, i) => {
        const on = i === diaSel
        const dow = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').slice(0, 3).toUpperCase()
        return (
          <button
            key={i}
            onClick={() => {
              setDiaSel(i)
              setSlotSel(null)
            }}
            className={`w-[54px] flex-none rounded-lg border-[1.5px] py-2.5 text-center transition-colors ${
              on ? 'border-brand bg-brand text-white' : 'border-line bg-surface'
            }`}
          >
            <div className={`text-[10.5px] font-semibold tracking-[0.4px] ${on ? 'text-white/80' : 'text-muted'}`}>{dow}</div>
            <div className={`mt-[3px] text-[19px] font-semibold ${on ? 'text-white' : 'text-ink'}`}>{d.getDate()}</div>
          </button>
        )
      })}
    </div>
  )

  const gradeHorarios = (colunas: string) => (
    <>
      <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">Horários disponíveis</div>
      {erro && <p className="mb-3 text-[13px] text-danger">{erro}</p>}
      {!servico ? (
        <p className="text-[13px] text-muted">Escolha o serviço primeiro.</p>
      ) : horarios.carregando ? (
        <div className="flex justify-center py-6 text-brand">
          <Spinner />
        </div>
      ) : horarios.erro ? (
        <p className="text-[13px] text-danger">{horarios.erro}</p>
      ) : (horarios.dados ?? []).length === 0 ? (
        <p className="text-[13px] text-muted">Nenhum horário livre neste dia. Tente outro.</p>
      ) : (
        <div className={`grid ${colunas} gap-2.5`}>
          {(horarios.dados ?? []).map((h) => {
            const on = slotSel === h
            return (
              <button
                key={h}
                onClick={() => setSlotSel(h)}
                className={`rounded-field border-[1.5px] py-[13px] text-center text-[14px] font-semibold transition-colors ${
                  on ? 'border-brand bg-brand text-white' : 'border-input-border bg-surface text-ink hover:border-ink'
                }`}
              >
                {h}
              </button>
            )
          })}
        </div>
      )}
    </>
  )

  const linhasResumo: [string, string][] = servico
    ? [
        ['Serviço', servico.nome],
        ['Barbearia', barbearia?.nome ?? ''],
        ['Data e hora', `${dataLabel} · ${slotSel ?? ''}`],
        ['Duração', `${servico.duracaoMinutos} min`],
      ]
    : []

  const calendario =
    servico && slotSel ? googleCalendarLink(dia, slotSel, servico.nome, servico.duracaoMinutos) : undefined

  /* ============================ Desktop (D2 / D6) =========================== */
  if (isDesktop) {
    const header = (
      <header className="flex flex-none items-center justify-between border-b border-line bg-surface px-11 py-5">
        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="text-[18px] font-semibold text-ink">ClipBook</span>
          <span className="ml-2 text-[13.5px] text-muted">· {barbearia?.nome}</span>
        </div>
        <Link to="/cliente/historico" className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-brand-tint text-[13px] font-bold text-brand">
            {initials(usuario?.nome ?? '')}
          </div>
          <span className="text-[13.5px] font-semibold text-ink">{usuario?.nome}</span>
        </Link>
      </header>
    )

    if ((step === 3 || step === 4) && servico) {
      const sucesso = step === 4
      return (
        <div className="flex min-h-dvh flex-col bg-screen">
          {header}
          <div className="flex flex-1">
            <div className="flex-1 border-r border-line px-14 py-11">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
                {sucesso ? 'Confirmado' : 'Passo final'}
              </div>
              <h2 className="mb-6 text-[28px] font-medium text-ink">
                {sucesso ? 'Agendado com sucesso!' : 'Confirmar agendamento'}
              </h2>
              <div className="mb-5 max-w-[460px] overflow-hidden rounded-card border border-line shadow-card">
                {linhasResumo.map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-line-2 bg-surface px-[18px] py-[15px]">
                    <span className="text-[13.5px] text-muted">{k}</span>
                    <span className="text-[13.5px] font-semibold text-ink">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-ink px-[18px] py-4">
                  <span className="text-[13.5px] font-medium text-white">Valor (pago na barbearia)</span>
                  <span className="text-[20px] font-semibold text-white">{formatCurrencyShort(servico.preco)}</span>
                </div>
              </div>

              {sucesso ? (
                <div className="flex max-w-[460px] gap-3">
                  <a
                    href={calendario}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 flex-1 items-center justify-center rounded-field border-[1.5px] border-input-border text-[13px] font-semibold uppercase tracking-[0.7px] text-ink transition-colors hover:bg-screen"
                  >
                    Adicionar ao calendário
                  </a>
                  <Button className="flex-1" onClick={() => navigate('/cliente/historico')}>
                    Ver meus agendamentos
                  </Button>
                </div>
              ) : (
                <div className="flex max-w-[460px] gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>
                    Voltar
                  </Button>
                  <Button className="flex-1" loading={enviando} onClick={confirmar}>
                    Confirmar agendamento
                  </Button>
                </div>
              )}
            </div>

            <div className="relative flex w-[440px] flex-none flex-col items-center justify-center overflow-hidden bg-ink px-10 text-center">
              <div className="absolute right-9 top-12 h-[130px] w-[26px] bg-brand opacity-50 [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
              <div className="absolute right-3 top-12 h-[130px] w-[26px] bg-brand-light opacity-50 [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
              {sucesso ? (
                <>
                  <div className="mb-6 flex h-22 w-22 animate-pop items-center justify-center rounded-full bg-brand-light/20">
                    <svg width="48" height="48" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="23" fill="#024ad8" />
                      <path d="M16 27l7 7 14-15" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-[24px] font-medium text-white">Tudo certo!</h3>
                  <p className="text-[13.5px] leading-relaxed text-white/60">
                    Seu horário já está na agenda da barbearia.
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white/10 text-4xl">
                    {servicoIcon(servico.nome)}
                  </div>
                  <h3 className="mb-2 text-[22px] font-medium text-white">{servico.nome}</h3>
                  <p className="text-[13.5px] leading-relaxed text-white/60">
                    {dataLabel} · {slotSel}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex min-h-dvh flex-col bg-screen">
        {header}
        <div className="flex flex-1">
          <div className="flex-1 px-11 py-9">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">Passo 1</div>
            <h2 className="mb-5 text-[26px] font-medium text-ink">Escolha o serviço</h2>
            <div className="max-w-[460px]">{listaServicos}</div>
          </div>
          <div className="flex-1 border-l border-line px-11 py-9">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">Passo 2</div>
            <h2 className="mb-5 text-[26px] font-medium text-ink">Escolha o horário</h2>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">Escolha o dia</div>
            {seletorDia}
            {gradeHorarios('grid-cols-4')}
            <Button className="mt-7 w-full" disabled={!servico || !slotSel} onClick={() => setStep(3)}>
              {servico ? `Confirmar ${servico.nome} · ${formatCurrencyShort(servico.preco)}` : 'Escolha um serviço'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ------------------------------ Passo 4 · sucesso ----------------------- */
  if (step === 4 && servico) {
    return (
      <AppShell className="bg-ink">
        <div className="relative flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="absolute right-11 top-16 h-[120px] w-[26px] bg-brand opacity-50 [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
          <div className="absolute right-4 top-16 h-[120px] w-[26px] bg-brand-light opacity-50 [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
          <div className="mb-6 flex h-26 w-26 animate-pop items-center justify-center rounded-full bg-brand-light/20">
            <svg width="56" height="56" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="23" fill="#024ad8" />
              <path d="M16 27l7 7 14-15" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand-light">Confirmado</div>
          <h1 className="mb-2 text-[28px] font-medium text-white">Agendado com sucesso!</h1>
          <p className="mb-6 text-[14px] leading-relaxed text-white/60">Seu horário já está na agenda da barbearia.</p>
          <div className="w-full rounded-card bg-surface-dark-2 p-[18px] text-left">
            <div className="mb-3 flex justify-between">
              <span className="text-[13px] text-white/55">Serviço</span>
              <span className="text-[13px] font-semibold text-white">{servico.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-white/55">Quando</span>
              <span className="text-[13px] font-semibold text-white">
                {dataLabel} · {slotSel}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-none px-[22px] pb-6 pt-3">
          <a
            href={calendario}
            target="_blank"
            rel="noreferrer"
            className="mb-[11px] flex h-[46px] w-full items-center justify-center rounded-field border-[1.5px] border-white/30 text-[13px] font-semibold uppercase tracking-[0.7px] text-white transition-colors hover:bg-white/10"
          >
            Adicionar ao calendário
          </a>
          <Button className="w-full hover:bg-brand-light!" onClick={() => navigate('/cliente/historico')}>
            Ver meus agendamentos
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell className="bg-screen">
      {step === 1 ? (
        <div className="flex flex-none items-start justify-between px-[22px] pb-3.5 pt-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">{barbearia?.nome} · Passo 1</div>
            <h1 className="m-0 mt-1 text-[25px] font-medium leading-tight text-ink">O que você vai fazer?</h1>
          </div>
          <Link
            to="/cliente/historico"
            aria-label="Voltar"
            className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-field border-[1.5px] border-line bg-surface text-[18px] leading-none text-ink-2 hover:bg-screen"
          >
            ×
          </Link>
        </div>
      ) : (
        <div className="flex flex-none items-center gap-2.5 px-[22px] pb-1 pt-4">
          <button
            onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
            aria-label="Voltar"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-field border-[1.5px] border-line bg-surface text-[18px] leading-none text-ink-2 hover:bg-screen"
          >
            ‹
          </button>
          <h2 className="m-0 text-[18px] font-semibold text-ink">{step === 2 ? 'Escolha o horário' : 'Confirmar'}</h2>
        </div>
      )}

      {step === 1 && (
        <>
          <div className="flex flex-1 flex-col px-[22px] pb-4 pt-0.5">{listaServicos}</div>
          <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3.5 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
            {servico && (
              <div className="mb-2.5 flex items-baseline justify-between">
                <span className="text-[12.5px] text-muted">Selecionado · {servico.nome}</span>
                <span className="text-[16px] font-semibold text-ink">{formatCurrencyShort(servico.preco)}</span>
              </div>
            )}
            <Button className="w-full" disabled={!servico} onClick={() => setStep(2)}>
              Continuar
            </Button>
          </div>
        </>
      )}

      {step === 2 && servico && (
        <>
          <div className="flex-none px-[22px] pb-3 pt-1">
            <div className="flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 shadow-card">
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-brand-tint text-[19px]">
                {servicoIcon(servico.nome)}
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted">Serviço</div>
                <div className="text-[15px] font-semibold text-ink">{servico.nome}</div>
                <div className="text-[12.5px] text-muted">
                  {servico.duracaoMinutos} min · {formatCurrencyShort(servico.preco)}
                </div>
              </div>
              <button onClick={() => setStep(1)} className="text-[12px] font-semibold uppercase tracking-[0.5px] text-brand">
                Trocar
              </button>
            </div>
          </div>
          <div className="flex flex-1 flex-col px-[22px] pb-4 pt-1.5">
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">Escolha o dia</div>
            {seletorDia}
            {gradeHorarios('grid-cols-3')}
          </div>
          <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3.5 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
            <Button className="w-full" disabled={!slotSel} onClick={() => setStep(3)}>
              Continuar
            </Button>
          </div>
        </>
      )}

      {step === 3 && servico && (
        <>
          <div className="flex flex-1 flex-col px-[22px] pb-4 pt-1">
            <div className="mb-4 overflow-hidden rounded-card border border-line shadow-card">
              {linhasResumo.map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-line-2 bg-surface px-4 py-[15px]">
                  <span className="text-[13.5px] text-muted">{k}</span>
                  <span className="text-[13.5px] font-semibold text-ink">{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between bg-ink px-4 py-4">
                <span className="text-[13.5px] font-medium text-white">Valor (pago na barbearia)</span>
                <span className="text-[22px] font-semibold text-white">{formatCurrencyShort(servico.preco)}</span>
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
            <Button className="w-full" loading={enviando} onClick={confirmar}>
              Confirmar agendamento
            </Button>
            <p className="mt-2.5 text-center text-[12px] text-muted">
              Dá para cancelar pelo seu histórico até o horário começar.
            </p>
          </div>
        </>
      )}
    </AppShell>
  )
}
