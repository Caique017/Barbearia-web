import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Header } from '../../components/layout/Header'
import { Badge, Button, Carregando, ErroCarregar, Modal, Vazio } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { useCarregar } from '../../hooks/useCarregar'
import { clienteApi } from '../../api/cliente'
import { apiErrorMessage } from '../../api/axios'
import type { Agendamento } from '../../types'
import { servicoIcon } from '../../utils/servico'
import { dataCurta, formatCurrencyShort, formatTime } from '../../utils/formatters'

export function HistoricoPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { dados, setDados, erro, carregando, recarregar } = useCarregar(clienteApi.meusAgendamentos)
  const [cancelando, setCancelando] = useState<Agendamento | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erroCancelar, setErroCancelar] = useState<string | null>(null)

  const [agora] = useState(() => Date.now())
  const { proximos, anteriores, totalCortes, totalGasto } = useMemo(() => {
    const todos = dados ?? []
    const futuros = todos
      .filter((a) => a.status === 'CONFIRMADO' && new Date(a.dataHora).getTime() > agora)
      .sort((a, b) => a.dataHora.localeCompare(b.dataHora))
    const passados = todos
      .filter((a) => !futuros.includes(a) && a.status !== 'REMARCADO')
      .sort((a, b) => b.dataHora.localeCompare(a.dataHora))
    const concluidos = todos.filter((a) => a.status === 'CONCLUIDO')
    return {
      proximos: futuros,
      anteriores: passados,
      totalCortes: concluidos.length,
      totalGasto: concluidos.reduce((acc, a) => acc + a.preco, 0),
    }
  }, [dados, agora])

  const primeiroNome = (usuario?.nome ?? '').split(' ')[0]

  const cancelar = async () => {
    if (!cancelando) return
    setOcupado(true)
    setErroCancelar(null)
    try {
      const atualizado = await clienteApi.cancelar(cancelando.id)
      setDados((prev) => (prev ?? []).map((a) => (a.id === atualizado.id ? atualizado : a)))
      setCancelando(null)
    } catch (e) {
      setErroCancelar(apiErrorMessage(e))
    } finally {
      setOcupado(false)
    }
  }

  return (
    <AppShell className="bg-screen">
      <Header />

      <div className="flex flex-1 flex-col gap-4 px-[22px] pb-4 pt-1">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">Seu histórico</div>
          <h1 className="m-0 mt-1 text-[24px] font-medium leading-tight text-ink">Olá, {primeiroNome} 👋</h1>
        </div>

        {carregando && !dados ? (
          <Carregando />
        ) : erro && !dados ? (
          <ErroCarregar mensagem={erro} onTentar={recarregar} />
        ) : (
          <>
            {/* Resumo — total de cortes + total gasto */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-card border border-line bg-surface p-4 shadow-card">
                <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-muted">Cortes</div>
                <div className="mt-1.5 text-[28px] font-semibold leading-none text-ink">{totalCortes}</div>
                <div className="mt-1 text-[12px] text-muted-2">no total</div>
              </div>
              <div className="rounded-card border border-line bg-surface p-4 shadow-card">
                <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-muted">Investido</div>
                <div className="mt-1.5 text-[28px] font-semibold leading-none text-ink">
                  {formatCurrencyShort(totalGasto)}
                </div>
                <div className="mt-1 text-[12px] text-muted-2">em cuidados</div>
              </div>
            </div>

            {/* Próximos horários */}
            {proximos.map((p) => (
              <div key={p.id} className="relative overflow-hidden rounded-card bg-ink p-[18px] text-white shadow-card">
                <div className="absolute -right-4 -top-6 h-[110px] w-[26px] rotate-[18deg] bg-brand opacity-40" />
                <div className="absolute right-4 -top-6 h-[110px] w-[26px] rotate-[18deg] bg-brand-light opacity-40" />
                <div className="relative">
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.6px] text-brand-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-light" />
                    Próximo horário
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-white/10 text-2xl">
                      {servicoIcon(p.servico.nome)}
                    </div>
                    <div className="flex-1">
                      <div className="text-[17px] font-semibold">{p.servico.nome}</div>
                      <div className="mt-0.5 text-[13px] text-white/60">
                        {dataCurta(p.dataHora)} · {formatTime(p.dataHora)}
                      </div>
                    </div>
                    <span className="text-[18px] font-semibold">{formatCurrencyShort(p.preco)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setErroCancelar(null)
                      setCancelando(p)
                    }}
                    className="mt-3 text-[11.5px] font-semibold uppercase tracking-[0.5px] text-white/60 hover:text-white"
                  >
                    Cancelar horário
                  </button>
                </div>
              </div>
            ))}

            {/* Anteriores */}
            <div>
              <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-muted">
                Cortes anteriores
              </div>
              {anteriores.length === 0 ? (
                <Vazio icone="✂️" titulo="Nada por aqui ainda" dica="Seus atendimentos aparecem aqui." />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {anteriores.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 shadow-card"
                    >
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-screen text-xl">
                        {servicoIcon(a.servico.nome)}
                      </div>
                      <div className="flex-1">
                        <div className="text-[15px] font-semibold text-ink">{a.servico.nome}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-[12.5px] text-muted">
                          {dataCurta(a.dataHora)}
                          {a.status !== 'CONCLUIDO' && <Badge status={a.status} />}
                        </div>
                      </div>
                      <span className="text-[15px] font-semibold text-ink">{formatCurrencyShort(a.preco)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3.5 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
        <Button className="w-full" disabled={!dados} onClick={() => navigate('/cliente/agendar')}>
          Marcar novo horário
        </Button>
      </div>

      <Modal open={cancelando !== null} onClose={() => setCancelando(null)} title="Cancelar este horário?">
        {cancelando && (
          <p className="mb-5 text-[14px] leading-relaxed text-ink-2">
            {cancelando.servico.nome} em {dataCurta(cancelando.dataHora)} às {formatTime(cancelando.dataHora)}. O
            horário volta a ficar livre para outra pessoa.
          </p>
        )}
        {erroCancelar && <p className="mb-3 text-[13px] text-danger">{erroCancelar}</p>}
        <Button variant="destructive" className="w-full" loading={ocupado} onClick={cancelar}>
          Confirmar cancelamento
        </Button>
        <Button
          variant="secondary"
          className="mt-2.5 w-full border-input-border text-ink"
          onClick={() => setCancelando(null)}
        >
          Voltar
        </Button>
      </Modal>
    </AppShell>
  )
}
