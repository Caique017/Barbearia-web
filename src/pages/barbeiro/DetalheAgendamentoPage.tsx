import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { TopBar } from '../../components/layout/TopBar'
import { Badge, Button, Modal } from '../../components/ui'
import { mockAgendamento } from '../../data/mock'
import { formatCurrencyShort, formatTime, initials, whatsappLink } from '../../utils/formatters'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const formatDetalheData = (iso: string) => {
  const d = new Date(iso)
  const weekday = cap(d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''))
  const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  return `${weekday}, ${d.getDate()} ${mes} · ${formatTime(iso)}`
}

export function DetalheAgendamentoPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  // TODO: integrar com API — GET /barbeiro/agendamento/:id
  const ag = mockAgendamento(id)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [cancelando, setCancelando] = useState(false)

  const confirmarCancelamento = async () => {
    setCancelando(true)
    try {
      // TODO: integrar com API — PATCH /barbeiro/agendamento/:id/status { status:'CANCELADO', motivo }
      await new Promise((r) => setTimeout(r, 500))
      navigate('/barbeiro/agenda')
    } finally {
      setCancelando(false)
    }
  }

  return (
    <AppShell className="bg-screen">
      <TopBar title="Detalhes" />

      <div className="flex flex-1 flex-col px-[22px] pb-6 pt-2">
        {/* Cabeçalho do agendamento */}
        <div className="mb-3.5 rounded-card border border-line border-l-4 border-l-brand bg-surface p-5 shadow-card">
          <Badge status={ag.status} />
          <div className="mb-0.5 mt-3 text-[26px] font-semibold text-ink">
            {formatDetalheData(ag.dataHora)}
          </div>
          <div className="text-[14px] text-muted">
            {ag.servico.nome} · {ag.servico.duracaoMinutos} min
          </div>
        </div>

        {/* Cliente */}
        <div className="mb-3.5 flex items-center gap-3 rounded-card border border-line bg-surface p-[15px] shadow-card">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-tint text-[15px] font-bold text-brand">
            {initials(ag.cliente.nome)}
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-ink">{ag.cliente.nome}</div>
            <div className="text-[13px] text-muted">{ag.cliente.whatsapp}</div>
          </div>
          <a
            href={whatsappLink(ag.cliente.whatsapp, ag.cliente.nome, formatTime(ag.dataHora))}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir WhatsApp"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-brand-tint text-brand"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.6.7.7-2.5-.2-.3A8 8 0 0 1 12 4z" />
            </svg>
          </a>
        </div>

        {/* Valor */}
        <div className="flex items-center justify-between rounded-card bg-ink p-4">
          <span className="text-[13.5px] font-medium text-white">Valor do serviço</span>
          <span className="text-[20px] font-semibold text-white">
            {formatCurrencyShort(ag.servico.preco)}
          </span>
        </div>
      </div>

      {/* Ações */}
      <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
        <div className="mb-2.5 flex gap-2.5">
          {/* TODO: integrar com API — editar horário / trocar serviço */}
          <Button variant="secondary" size="sm" className="h-[46px] flex-1 text-[12px]">
            Editar horário
          </Button>
          <Button variant="secondary" size="sm" className="h-[46px] flex-1 text-[12px]">
            Trocar serviço
          </Button>
        </div>
        <Button
          variant="destructiveOutline"
          className="h-[46px] w-full text-[12px]"
          onClick={() => setCancelOpen(true)}
        >
          Cancelar agendamento
        </Button>
        <p className="mt-2 text-center text-[12px] text-muted">
          Cancela o horário sem gerar cobrança.
        </p>
      </div>

      {/* Modal de cancelamento */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-danger-tint">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b3262b" strokeWidth="2.2">
            <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
        </div>
        <h2 className="mb-1.5 text-[23px] font-medium leading-tight text-ink">
          Cancelar este agendamento?
        </h2>
        <p className="mb-5 text-[14px] leading-relaxed text-ink-2">
          O horário voltará a ficar disponível. Esta ação não pode ser desfeita.
        </p>
        <div className="mb-5 rounded-card border border-line border-l-4 border-l-danger bg-surface px-4 py-3.5 opacity-80">
          <div className="flex items-center gap-3">
            <div className="text-[18px] font-semibold text-ink">{formatTime(ag.dataHora)}</div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-ink">{ag.cliente.nome}</div>
              <div className="text-[12.5px] text-muted">
                {ag.servico.nome} · {ag.servico.duracaoMinutos} min
              </div>
            </div>
          </div>
        </div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.4px] text-muted">
          Motivo <span className="font-normal normal-case tracking-normal">(opcional)</span>
        </label>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex: cliente pediu para remarcar"
          className="mb-5 h-[84px] w-full resize-none rounded-field border-[1.5px] border-input-border bg-surface px-3.5 py-3 text-[14.5px] text-ink outline-none placeholder:text-placeholder focus:border-ink"
        />
        <Button
          variant="destructive"
          className="w-full"
          loading={cancelando}
          onClick={confirmarCancelamento}
        >
          Confirmar cancelamento
        </Button>
        <Button
          variant="secondary"
          className="mt-2.5 w-full border-input-border text-ink"
          onClick={() => setCancelOpen(false)}
        >
          Voltar
        </Button>
      </Modal>
    </AppShell>
  )
}
