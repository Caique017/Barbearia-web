import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { Logo } from '../../components/layout/Logo'
import { Button, Input } from '../../components/ui'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { mockHorarios, mockServicos, servicoIcon, servicoMeta } from '../../data/mock'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrencyShort, initials } from '../../utils/formatters'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

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

const CheckCircle = ({ on, sm }: { on: boolean; sm?: boolean }) => (
  <div
    className={`flex flex-none items-center justify-center rounded-full border-[1.5px] ${
      sm ? 'h-5 w-5' : 'h-[22px] w-[22px]'
    } ${on ? 'border-brand bg-brand' : 'border-input-border bg-transparent'}`}
  >
    {on && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6.2l2.3 2.3L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </div>
)

/** Próximos 7 dias para o strip de datas. */
function useProximosDias() {
  return useMemo(() => {
    const hoje = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoje)
      d.setDate(hoje.getDate() + i)
      return d
    })
  }, [])
}

export function AgendamentoPage() {
  const navigate = useNavigate()
  const { isAuthenticated, usuario } = useAuth()
  const dias = useProximosDias()

  const servicos = useMemo(() => mockServicos.filter((s) => s.ativo), [])
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [servicoSel, setServicoSel] = useState<string>(
    servicos.find((s) => s.id === 'combo')?.id ?? servicos[0].id,
  )
  const [diaSel, setDiaSel] = useState(0)
  const [slotSel, setSlotSel] = useState<string | null>(null)
  const [nome, setNome] = useState(usuario?.nome ?? '')
  const [whats, setWhats] = useState('')
  const [enviando, setEnviando] = useState(false)

  const servico = servicos.find((s) => s.id === servicoSel) ?? servicos[0]
  const dataLabel = useMemo(() => {
    const d = dias[diaSel]
    const weekday = cap(d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''))
    const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    return `${weekday}, ${d.getDate()} ${mes}`
  }, [dias, diaSel])

  const dadosOk = isAuthenticated || (nome.trim() !== '' && whats.trim() !== '')

  const confirmar = async () => {
    setEnviando(true)
    try {
      // TODO: integrar com API — POST /cliente/agendamento (ou público)
      await new Promise((r) => setTimeout(r, 700))
      setStep(4)
    } finally {
      setEnviando(false)
    }
  }

  const isDesktop = useIsDesktop()

  /* ============================ Desktop (D2 / D6) =========================== */
  if (isDesktop) {
    const header = (
      <header className="flex flex-none items-center justify-between border-b border-line bg-surface px-11 py-5">
        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="text-[18px] font-semibold text-ink">ClipBook</span>
        </div>
        {isAuthenticated ? (
          <div className="flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-brand-tint text-[13px] font-bold text-brand">
              {initials(usuario?.nome ?? 'Cliente')}
            </div>
            <span className="text-[13.5px] font-semibold text-ink">{usuario?.nome}</span>
          </div>
        ) : (
          <Link to="/login" className="text-[13.5px] font-semibold text-brand">
            Entrar
          </Link>
        )}
      </header>
    )

    /* --------- Passo final / sucesso (D6) --------- */
    if (step === 3 || step === 4) {
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
                {[
                  ['Serviço', servico.nome],
                  ['Barbeiro', 'Ricardo Nunes'],
                  ['Data e hora', `${dataLabel} · ${slotSel}`],
                  ['Duração', `${servico.duracaoMinutos} min`],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between border-b border-line-2 bg-surface px-[18px] py-[15px]"
                  >
                    <span className="text-[13.5px] text-muted">{k}</span>
                    <span className="text-[13.5px] font-semibold text-ink">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-ink px-[18px] py-4">
                  <span className="text-[13.5px] font-medium text-white">Valor total</span>
                  <span className="text-[20px] font-semibold text-white">
                    {formatCurrencyShort(servico.preco)}
                  </span>
                </div>
              </div>

              {!sucesso && !isAuthenticated && (
                <div className="mb-5 flex max-w-[460px] flex-col gap-3">
                  <Input label="Nome" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                  <Input
                    label="WhatsApp"
                    type="tel"
                    placeholder="(11) 9 8888-7777"
                    value={whats}
                    onChange={(e) => setWhats(e.target.value)}
                  />
                </div>
              )}

              {sucesso ? (
                <div className="flex max-w-[460px] gap-3">
                  <a
                    href={googleCalendarLink(dias[diaSel], slotSel ?? '', servico.nome, servico.duracaoMinutos)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 flex-1 items-center justify-center rounded-field border-[1.5px] border-input-border text-[13px] font-semibold uppercase tracking-[0.7px] text-ink transition-colors hover:bg-screen"
                  >
                    Adicionar ao calendário
                  </a>
                  <Button
                    className="flex-1"
                    onClick={() => navigate(isAuthenticated ? '/cliente/historico' : '/login')}
                  >
                    Ver meus agendamentos
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full max-w-[460px]"
                  disabled={!dadosOk}
                  loading={enviando}
                  onClick={confirmar}
                >
                  Confirmar agendamento
                </Button>
              )}
            </div>

            {/* Painel escuro à direita */}
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
                  <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand-light">
                    Confirmado
                  </div>
                  <h3 className="mb-2 text-[24px] font-medium text-white">Tudo certo!</h3>
                  <p className="text-[13.5px] leading-relaxed text-white/60">
                    Enviamos os detalhes no seu WhatsApp.
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white/10 text-4xl">
                    {servicoIcon(servico.id)}
                  </div>
                  <h3 className="mb-2 text-[22px] font-medium text-white">{servico.nome}</h3>
                  <p className="text-[13.5px] leading-relaxed text-white/60">
                    {dataLabel} · {slotSel}
                  </p>
                  <p className="mt-6 text-[12.5px] text-white/45">
                    Revise os detalhes ao lado e confirme seu horário.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )
    }

    /* --------- Escolher serviço + horário (D2) --------- */
    return (
      <div className="flex min-h-dvh flex-col bg-screen">
        {header}
        <div className="flex flex-1">
          {/* Serviço */}
          <div className="flex-1 px-11 py-9">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
              ClipBook · Passo 1
            </div>
            <h2 className="mb-5 text-[26px] font-medium text-ink">Escolha o serviço</h2>
            <div className="flex max-w-[460px] flex-col gap-2.5">
              {servicos.map((s) => {
                const on = servicoSel === s.id
                const meta = servicoMeta[s.id]
                return (
                  <button
                    key={s.id}
                    onClick={() => setServicoSel(s.id)}
                    className={`flex items-start gap-3 rounded-card border-[1.5px] p-4 text-left transition-colors ${
                      on ? 'border-brand bg-brand-tint shadow-card' : 'border-line bg-surface shadow-card'
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg text-xl ${
                        on ? 'bg-brand-tint-2' : 'bg-screen'
                      }`}
                    >
                      {servicoIcon(s.id)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-semibold text-ink">{s.nome}</span>
                        {meta?.tag && (
                          <span className="rounded-[3px] bg-alert px-[7px] py-0.5 text-[10px] font-bold tracking-[0.2px] text-white">
                            {meta.tag}
                          </span>
                        )}
                      </div>
                      {meta?.desc && (
                        <div className="mt-0.5 text-[12.5px] leading-snug text-muted">{meta.desc}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[17px] font-semibold text-ink">
                        {formatCurrencyShort(s.preco)}
                      </span>
                      <CheckCircle on={on} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dia + horário */}
          <div className="flex-1 border-l border-line px-11 py-9">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
              Passo 2
            </div>
            <h2 className="mb-5 text-[26px] font-medium text-ink">Escolha o horário</h2>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
              Escolha o dia
            </div>
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1.5">
              {dias.map((d, i) => {
                const on = i === diaSel
                const dow = cap(d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')).slice(0, 3).toUpperCase()
                return (
                  <button
                    key={i}
                    onClick={() => setDiaSel(i)}
                    className={`w-[54px] flex-none rounded-lg border-[1.5px] py-2.5 text-center transition-colors ${
                      on ? 'border-brand bg-brand text-white' : 'border-line bg-surface'
                    }`}
                  >
                    <div className={`text-[10.5px] font-semibold tracking-[0.4px] ${on ? 'text-white/80' : 'text-muted'}`}>
                      {dow}
                    </div>
                    <div className={`mt-[3px] text-[19px] font-semibold ${on ? 'text-white' : 'text-ink'}`}>
                      {d.getDate()}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
              Horários disponíveis
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {mockHorarios.map((h) => {
                const on = slotSel === h.hora && h.disponivel
                return (
                  <button
                    key={h.hora}
                    disabled={!h.disponivel}
                    onClick={() => setSlotSel(h.hora)}
                    className={`rounded-field border-[1.5px] py-[13px] text-center text-[14px] font-semibold transition-colors ${
                      !h.disponivel
                        ? 'cursor-not-allowed border-transparent bg-line text-placeholder line-through'
                        : on
                          ? 'border-brand bg-brand text-white'
                          : 'border-input-border bg-surface text-ink hover:border-ink'
                    }`}
                  >
                    {h.hora}
                  </button>
                )
              })}
            </div>
            <Button className="mt-7 w-full" disabled={!slotSel} onClick={() => setStep(3)}>
              Confirmar {servico.nome} · {formatCurrencyShort(servico.preco)}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ------------------------------ Passo 4 · sucesso ----------------------- */
  if (step === 4) {
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
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand-light">
            Confirmado
          </div>
          <h1 className="mb-2 text-[28px] font-medium text-white">Agendado com sucesso!</h1>
          <p className="mb-6 text-[14px] leading-relaxed text-white/60">
            Enviamos os detalhes no seu WhatsApp.
          </p>
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
          {slotSel && (
            <a
              href={googleCalendarLink(dias[diaSel], slotSel, servico.nome, servico.duracaoMinutos)}
              target="_blank"
              rel="noreferrer"
              className="mb-[11px] flex h-[46px] w-full items-center justify-center rounded-field border-[1.5px] border-white/30 text-[13px] font-semibold uppercase tracking-[0.7px] text-white transition-colors hover:bg-white/10"
            >
              Adicionar ao calendário
            </a>
          )}
          <Button
            className="w-full hover:bg-brand-light!"
            onClick={() => navigate(isAuthenticated ? '/cliente/historico' : '/login')}
          >
            Ver meus agendamentos
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell className="bg-screen">
      {step === 1 ? (
        <div className="flex-none px-[22px] pb-3.5 pt-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
            ClipBook · Passo 1
          </div>
          <h1 className="m-0 mt-1 text-[25px] font-medium leading-tight text-ink">
            O que você vai fazer hoje?
          </h1>
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
          <h2 className="m-0 text-[18px] font-semibold text-ink">
            {step === 2 ? 'Escolha o horário' : 'Confirmar'}
          </h2>
        </div>
      )}

      {/* Passo 1 — serviço */}
      {step === 1 && (
        <>
          <div className="flex flex-1 flex-col gap-2.5 px-[22px] pb-4 pt-0.5">
            {servicos.map((s) => {
              const on = servicoSel === s.id
              const meta = servicoMeta[s.id]
              return (
                <button
                  key={s.id}
                  onClick={() => setServicoSel(s.id)}
                  className={`flex items-start gap-3 rounded-card border-[1.5px] p-4 text-left transition-colors ${
                    on ? 'border-brand bg-brand-tint shadow-card' : 'border-line bg-surface shadow-card'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg text-xl ${
                      on ? 'bg-brand-tint-2' : 'bg-screen'
                    }`}
                  >
                    {servicoIcon(s.id)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-semibold text-ink">{s.nome}</span>
                      {meta?.tag && (
                        <span className="rounded-[3px] bg-alert px-[7px] py-0.5 text-[10px] font-bold tracking-[0.2px] text-white">
                          {meta.tag}
                        </span>
                      )}
                    </div>
                    {meta?.desc && (
                      <div className="mt-0.5 text-[12.5px] leading-snug text-muted">{meta.desc}</div>
                    )}
                    <div className="mt-1.5 text-[11.5px] font-medium text-muted-2">
                      {s.duracaoMinutos} min
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[17px] font-semibold text-ink">
                      {formatCurrencyShort(s.preco)}
                    </span>
                    <CheckCircle on={on} />
                  </div>
                </button>
              )
            })}
          </div>
          <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3.5 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
            <div className="mb-2.5 flex items-baseline justify-between">
              <span className="text-[12.5px] text-muted">Selecionado · {servico.nome}</span>
              <span className="text-[16px] font-semibold text-ink">
                {formatCurrencyShort(servico.preco)}
              </span>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Continuar
            </Button>
          </div>
        </>
      )}

      {/* Passo 2 — dia e horário */}
      {step === 2 && (
        <>
          <div className="flex-none px-[22px] pb-3 pt-1">
            <div className="flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 shadow-card">
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-brand-tint text-[19px]">
                {servicoIcon(servico.id)}
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted">
                  Serviço
                </div>
                <div className="text-[15px] font-semibold text-ink">{servico.nome}</div>
                <div className="text-[12.5px] text-muted">
                  {servico.duracaoMinutos} min · {formatCurrencyShort(servico.preco)}
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-[12px] font-semibold uppercase tracking-[0.5px] text-brand"
              >
                Trocar
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col px-[22px] pb-4 pt-1.5">
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
              Escolha o dia
            </div>
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1.5">
              {dias.map((d, i) => {
                const on = i === diaSel
                const dow = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').slice(0, 3).toUpperCase()
                return (
                  <button
                    key={i}
                    onClick={() => setDiaSel(i)}
                    className={`w-[54px] flex-none rounded-lg border-[1.5px] py-2.5 text-center transition-colors ${
                      on ? 'border-brand bg-brand text-white' : 'border-line bg-surface'
                    }`}
                  >
                    <div className={`text-[10.5px] font-semibold tracking-[0.4px] ${on ? 'text-white/80' : 'text-muted'}`}>
                      {dow}
                    </div>
                    <div className={`mt-[3px] text-[19px] font-semibold ${on ? 'text-white' : 'text-ink'}`}>
                      {d.getDate()}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
                Horários disponíveis
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-2">
                <span className="h-[9px] w-[9px] rounded-sm bg-line" />
                ocupado
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {mockHorarios.map((h) => {
                const on = slotSel === h.hora && h.disponivel
                return (
                  <button
                    key={h.hora}
                    disabled={!h.disponivel}
                    onClick={() => setSlotSel(h.hora)}
                    className={`rounded-field border-[1.5px] py-[13px] text-center text-[14px] font-semibold transition-colors ${
                      !h.disponivel
                        ? 'cursor-not-allowed border-transparent bg-line text-placeholder line-through'
                        : on
                          ? 'border-brand bg-brand text-white'
                          : 'border-input-border bg-surface text-ink hover:border-ink'
                    }`}
                  >
                    {h.hora}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3.5 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
            <Button className="w-full" disabled={!slotSel} onClick={() => setStep(3)}>
              Continuar
            </Button>
          </div>
        </>
      )}

      {/* Passo 3 — confirmação */}
      {step === 3 && (
        <>
          <div className="flex flex-1 flex-col px-[22px] pb-4 pt-1">
            <div className="mb-4 overflow-hidden rounded-card border border-line shadow-card">
              {[
                ['Serviço', servico.nome],
                ['Barbeiro', 'Ricardo Nunes'],
                ['Data e hora', `${dataLabel} · ${slotSel}`],
                ['Duração', `${servico.duracaoMinutos} min`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between border-b border-line-2 bg-surface px-4 py-[15px]"
                >
                  <span className="text-[13.5px] text-muted">{k}</span>
                  <span className="text-[13.5px] font-semibold text-ink">{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between bg-ink px-4 py-4">
                <span className="text-[13.5px] font-medium text-white">Valor total</span>
                <span className="text-[22px] font-semibold text-white">
                  {formatCurrencyShort(servico.preco)}
                </span>
              </div>
            </div>

            {!isAuthenticated && (
              <>
                <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
                  Seus dados
                </div>
                <div className="flex flex-col gap-3">
                  <Input
                    label="Nome"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                  <Input
                    label="WhatsApp"
                    type="tel"
                    placeholder="(11) 9 8888-7777"
                    value={whats}
                    onChange={(e) => setWhats(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
            <Button className="w-full" disabled={!dadosOk} loading={enviando} onClick={confirmar}>
              Confirmar agendamento
            </Button>
            <p className="mt-2.5 text-center text-[12px] text-muted">
              Você receberá um lembrete no WhatsApp antes do horário.
            </p>
          </div>
        </>
      )}
    </AppShell>
  )
}
