import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { TopBar } from '../../components/layout/TopBar'
import { PanelShell } from '../../components/layout/PanelShell'
import { Button, Input } from '../../components/ui'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { mockClientes, mockHorarios, mockServicos, servicoIcon } from '../../data/mock'
import type { Cliente } from '../../types'
import { formatCurrencyShort } from '../../utils/formatters'
import { initials } from '../../utils/formatters'

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

export function NovoAgendamentoPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)

  // Passo 1 — cliente
  const [busca, setBusca] = useState('')
  const [clienteSel, setClienteSel] = useState<string | null>(null)
  const [novoNome, setNovoNome] = useState('')
  const [novoWhats, setNovoWhats] = useState('')

  // Passo 2 — serviço e horário
  const [servicoSel, setServicoSel] = useState<string | null>(null)
  const [slotSel, setSlotSel] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const servicosAtivos = useMemo(() => mockServicos.filter((s) => s.ativo), [])
  const resultados = useMemo(
    () =>
      mockClientes.filter(
        (c) =>
          busca.trim() === '' ||
          c.nome.toLowerCase().includes(busca.toLowerCase()) ||
          c.whatsapp.includes(busca),
      ),
    [busca],
  )

  const clienteEscolhido: Cliente | null =
    (clienteSel && mockClientes.find((c) => c.id === clienteSel)) ||
    (novoNome.trim() ? { id: 'novo', nome: novoNome, whatsapp: novoWhats } : null)

  const podeAvancar = !!clienteEscolhido
  const podeConfirmar = !!servicoSel && !!slotSel

  const confirmar = async () => {
    setEnviando(true)
    try {
      // TODO: integrar com API — POST /barbeiro/agendamento
      await new Promise((r) => setTimeout(r, 600))
      navigate('/barbeiro/agenda')
    } finally {
      setEnviando(false)
    }
  }

  const isDesktop = useIsDesktop()

  /* ------------------------------- Desktop (D7) ------------------------------ */
  if (isDesktop) {
    return (
      <PanelShell>
        <h2 className="mb-6 text-[26px] font-medium text-ink">Novo agendamento</h2>
        <div className="flex max-w-[900px] gap-9">
          {/* 1 · Cliente */}
          <div className="flex-1">
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
              1 · Cliente
            </div>
            <div className="relative mb-3.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a5a5a5"
                strokeWidth="2"
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4" />
              </svg>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar cliente"
                className="h-11 w-full rounded-full border-[1.5px] border-input-border bg-surface pl-10 pr-3.5 text-[14px] text-ink outline-none placeholder:text-placeholder focus:border-ink"
              />
            </div>
            <div className="mb-4 flex flex-col gap-2.5">
              {resultados.map((c) => {
                const on = clienteSel === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setClienteSel(on ? null : c.id)
                      setNovoNome('')
                      setNovoWhats('')
                    }}
                    className={`flex items-center gap-3 rounded-card border-[1.5px] p-3 text-left transition-colors ${
                      on ? 'border-brand bg-brand-tint shadow-card' : 'border-line bg-surface shadow-card'
                    }`}
                  >
                    <div
                      className={`flex h-[42px] w-[42px] flex-none items-center justify-center rounded-lg text-[14px] font-bold ${
                        on ? 'bg-brand text-white' : 'bg-brand-tint text-brand'
                      }`}
                    >
                      {initials(c.nome)}
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-semibold text-ink">{c.nome}</div>
                      <div className="text-[11.5px] text-muted">{c.whatsapp}</div>
                    </div>
                    <CheckCircle on={on} />
                  </button>
                )
              })}
            </div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-line-3" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted">
                ou cadastrar novo
              </span>
              <div className="h-px flex-1 bg-line-3" />
            </div>
            <div className="flex flex-col gap-3">
              <Input
                label="Nome"
                placeholder="Nome do cliente"
                value={novoNome}
                onChange={(e) => {
                  setNovoNome(e.target.value)
                  setClienteSel(null)
                }}
              />
              <Input
                label="WhatsApp"
                type="tel"
                placeholder="(11) 9 8888-7777"
                value={novoWhats}
                onChange={(e) => setNovoWhats(e.target.value)}
              />
            </div>
          </div>

          {/* 2 · Serviço e horário */}
          <div className="flex-1">
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
              2 · Serviço e horário
            </div>
            <div className="mb-4 flex flex-col gap-2.5">
              {servicosAtivos.map((s) => {
                const on = servicoSel === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setServicoSel(s.id)}
                    className={`flex items-center gap-3 rounded-card border-[1.5px] p-3.5 text-left transition-colors ${
                      on ? 'border-brand bg-brand-tint shadow-card' : 'border-line bg-surface shadow-card'
                    }`}
                  >
                    <span className="flex-1 text-[14.5px] font-semibold text-ink">{s.nome}</span>
                    <span className="text-[14.5px] font-semibold text-ink">
                      {formatCurrencyShort(s.preco)}
                    </span>
                    <CheckCircle on={on} />
                  </button>
                )
              })}
            </div>
            <div className="mb-5 grid grid-cols-4 gap-2">
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
            <Button
              className="w-full"
              disabled={!clienteEscolhido || !podeConfirmar}
              loading={enviando}
              onClick={confirmar}
            >
              Confirmar agendamento
            </Button>
          </div>
        </div>
      </PanelShell>
    )
  }

  /* --------------------------- Mobile (2.3 / 2.4) ---------------------------- */
  return (
    <AppShell className="bg-screen">
      <TopBar title="Novo agendamento" />

      {/* Progresso */}
      <div className="flex-none px-[22px] pb-3 pt-2.5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.4px] text-brand">
            Passo {step} de 2
          </span>
          <span className="text-[12.5px] text-muted">
            · {step === 1 ? 'Cliente' : 'Serviço e horário'}
          </span>
        </div>
        <div className="flex gap-[5px]">
          <div className="h-1 flex-1 rounded bg-brand" />
          <div className={`h-1 flex-1 rounded ${step === 2 ? 'bg-brand' : 'bg-line-3'}`} />
        </div>
      </div>

      {step === 1 ? (
        <div className="flex flex-1 flex-col px-[22px] pb-24 pt-0.5">
          <div className="relative mb-4">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a5a5a5"
              strokeWidth="2"
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou WhatsApp"
              className="h-[46px] w-full rounded-full border-[1.5px] border-input-border bg-surface pl-10 pr-3.5 text-[14.5px] text-ink outline-none placeholder:text-placeholder focus:border-ink"
            />
          </div>

          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
            Resultados
          </div>
          <div className="mb-5 flex flex-col gap-2.5">
            {resultados.length === 0 && (
              <p className="text-[13px] text-muted">Nenhum cliente encontrado.</p>
            )}
            {resultados.map((c) => {
              const on = clienteSel === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setClienteSel(on ? null : c.id)
                    setNovoNome('')
                    setNovoWhats('')
                  }}
                  className={`flex items-center gap-3 rounded-card border-[1.5px] p-3 text-left transition-colors ${
                    on ? 'border-brand bg-brand-tint shadow-card' : 'border-line bg-surface shadow-card'
                  }`}
                >
                  <div
                    className={`flex h-[42px] w-[42px] flex-none items-center justify-center rounded-lg text-[14px] font-bold ${
                      on ? 'bg-brand text-white' : 'bg-brand-tint text-brand'
                    }`}
                  >
                    {initials(c.nome)}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14.5px] font-semibold text-ink">{c.nome}</div>
                    <div className="text-[12px] text-muted">{c.whatsapp}</div>
                  </div>
                  <CheckCircle on={on} />
                </button>
              )
            })}
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-line-3" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted">
              ou cadastrar novo
            </span>
            <div className="h-px flex-1 bg-line-3" />
          </div>

          <div className="flex flex-col gap-3">
            <Input
              label="Nome"
              placeholder="Nome do cliente"
              value={novoNome}
              onChange={(e) => {
                setNovoNome(e.target.value)
                setClienteSel(null)
              }}
            />
            <Input
              label="WhatsApp"
              type="tel"
              placeholder="(11) 9 8888-7777"
              value={novoWhats}
              onChange={(e) => setNovoWhats(e.target.value)}
            />
            <p className="text-[12px] leading-relaxed text-muted">
              Sem senha por agora. O cliente pode criar uma conta depois para ver o histórico.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col px-[22px] pb-24 pt-0.5">
          {/* Cliente escolhido */}
          <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-tint text-[12px] font-bold text-brand">
              {initials(clienteEscolhido?.nome ?? '')}
            </div>
            <div className="flex-1">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.4px] text-muted">
                Cliente
              </div>
              <div className="text-[13.5px] font-semibold text-ink">{clienteEscolhido?.nome}</div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-[11px] font-semibold uppercase tracking-[0.4px] text-brand"
            >
              Trocar
            </button>
          </div>

          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
            Serviço
          </div>
          <div className="mb-5 flex flex-col gap-2.5">
            {servicosAtivos.map((s) => {
              const on = servicoSel === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setServicoSel(s.id)}
                  className={`flex items-center gap-3 rounded-card border-[1.5px] p-[15px] text-left transition-colors ${
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
                    <span className="text-[15px] font-semibold text-ink">{s.nome}</span>
                    <div className="mt-0.5 text-[12px] text-muted">{s.duracaoMinutos} min</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[15px] font-semibold text-ink">
                      {formatCurrencyShort(s.preco)}
                    </span>
                    <CheckCircle on={on} />
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
            Horário · hoje
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
      )}

      {/* Rodapé fixo */}
      <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3.5 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
        {step === 1 ? (
          <Button className="w-full" disabled={!podeAvancar} onClick={() => setStep(2)}>
            Continuar
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={!podeConfirmar}
            loading={enviando}
            onClick={confirmar}
          >
            Confirmar agendamento
          </Button>
        )}
      </div>
    </AppShell>
  )
}
