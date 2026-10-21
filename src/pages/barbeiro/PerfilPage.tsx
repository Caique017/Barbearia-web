import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { PanelShell } from '../../components/layout/PanelShell'
import { Button, Card, Carregando, ErroCarregar, Input } from '../../components/ui'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { useCarregar } from '../../hooks/useCarregar'
import { useAuth } from '../../hooks/useAuth'
import { barbeiroApi } from '../../api/barbeiro'
import { apiErrorMessage } from '../../api/axios'
import type { Bloqueio, DiaSemana, FaixaHorario, PerfilBarbeiro } from '../../types'
import { diasDaSemana } from '../../utils/dias'
import { formatTime, horaCurta, toISODate } from '../../utils/formatters'

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="m-0 text-[16px] font-semibold text-ink">{titulo}</h2>
      {descricao && <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-muted">{descricao}</p>}
      <div className="mt-4">{children}</div>
    </Card>
  )
}

/** Mensagem de sucesso ou erro embaixo de cada formulário. */
function Retorno({ ok, erro }: { ok?: string | null; erro?: string | null }) {
  if (erro) return <p className="m-0 mt-2 text-[13px] text-danger">{erro}</p>
  if (ok) return <p className="m-0 mt-2 text-[13px] text-brand">{ok}</p>
  return null
}

/* ------------------------------ Dados da barbearia ----------------------------- */
function SecaoBarbearia({ perfil, onSalvo }: { perfil: PerfilBarbeiro; onSalvo: (p: PerfilBarbeiro) => void }) {
  const [nome, setNome] = useState(perfil.nomeBarbearia)
  const [horario, setHorario] = useState(perfil.horarioFuncionamento ?? '')
  const [salvando, setSalvando] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const salvar = async () => {
    setSalvando(true)
    setOk(null)
    setErro(null)
    try {
      // PATCH: só manda o horário se houver texto — a API não aceita em branco.
      onSalvo(
        await barbeiroApi.atualizarPerfil({
          nomeBarbearia: nome.trim(),
          ...(horario.trim() ? { horarioFuncionamento: horario.trim() } : {}),
        }),
      )
      setOk('Salvo.')
    } catch (e) {
      setErro(apiErrorMessage(e))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Secao titulo="Sua barbearia" descricao="O nome e o texto de horário aparecem na página do seu link.">
      <div className="flex flex-col gap-3">
        <Input label="Nome da barbearia" maxLength={120} value={nome} onChange={(e) => setNome(e.target.value)} />
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.4px] text-muted">
            Horário (texto livre)
          </label>
          <textarea
            value={horario}
            maxLength={255}
            onChange={(e) => setHorario(e.target.value)}
            placeholder={'Seg a Sex 9h–19h\nSáb 9h–14h'}
            className="h-[76px] w-full resize-none rounded-field border-[1.5px] border-input-border bg-surface px-3.5 py-3 text-[14.5px] text-ink outline-none placeholder:text-placeholder focus:border-ink"
          />
        </div>
        <Button className="w-full" loading={salvando} disabled={!nome.trim()} onClick={salvar}>
          Salvar
        </Button>
        <Retorno ok={ok} erro={erro} />
      </div>
    </Secao>
  )
}

/* ----------------------------------- Link ---------------------------------- */
function SecaoLink({ perfil, onSalvo }: { perfil: PerfilBarbeiro; onSalvo: (p: PerfilBarbeiro) => void }) {
  const [slug, setSlug] = useState(perfil.slug)
  const [salvando, setSalvando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const link = `${window.location.origin}/b/${perfil.slug}`

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setErro('Não foi possível copiar. Selecione o link e copie à mão.')
    }
  }

  const salvar = async () => {
    setSalvando(true)
    setOk(null)
    setErro(null)
    try {
      onSalvo(await barbeiroApi.trocarSlug(slug.trim()))
      setOk('Link trocado. O antigo parou de funcionar.')
    } catch (e) {
      setErro(apiErrorMessage(e))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Secao titulo="Seu link" descricao="Mande para os clientes: por ele eles criam conta e agendam.">
      <div className="mb-4 flex items-center gap-2">
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 flex-1 truncate rounded-field border-[1.5px] border-line bg-screen px-3 py-[11px] text-[13.5px] font-medium text-brand"
        >
          {link}
        </a>
        <Button size="sm" className="h-[46px]" onClick={copiar}>
          {copiado ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
      <div className="flex items-end gap-2">
        <Input
          label="Trocar o final do link"
          className="flex-1"
          maxLength={110}
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
        />
        <Button
          variant="secondary"
          size="sm"
          className="h-[46px]"
          loading={salvando}
          disabled={!slug.trim() || slug.trim() === perfil.slug}
          onClick={salvar}
        >
          Trocar
        </Button>
      </div>
      <p className="m-0 mt-1.5 text-[12px] text-muted">Letras minúsculas, números e hífen entre palavras.</p>
      <Retorno ok={ok} erro={erro} />
    </Secao>
  )
}

/* ------------------------------ Faixas de horário ----------------------------- */
function SecaoHorarios() {
  const { dados, erro: erroCarregar, carregando, recarregar } = useCarregar(barbeiroApi.horarios)
  const [faixas, setFaixas] = useState<FaixaHorario[]>([])
  const [salvando, setSalvando] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (dados) setFaixas(dados.map((f) => ({ ...f, abre: horaCurta(f.abre), fecha: horaCurta(f.fecha) })))
  }, [dados])

  const doDia = (dia: DiaSemana) => faixas.map((f, i) => ({ f, i })).filter(({ f }) => f.diaSemana === dia)

  const mudar = (i: number, campo: 'abre' | 'fecha', valor: string) =>
    setFaixas((prev) => prev.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)))

  const adicionar = (dia: DiaSemana) => {
    const ultima = doDia(dia).at(-1)?.f
    setFaixas((prev) => [
      ...prev,
      ultima ? { diaSemana: dia, abre: ultima.fecha, fecha: '19:00' } : { diaSemana: dia, abre: '09:00', fecha: '18:00' },
    ])
  }

  const remover = (i: number) => setFaixas((prev) => prev.filter((_, j) => j !== i))

  const salvar = async () => {
    if (faixas.some((f) => !f.abre || !f.fecha || f.abre >= f.fecha))
      return setErro('Em cada faixa, a hora de abrir vem antes da de fechar.')
    setSalvando(true)
    setOk(null)
    setErro(null)
    try {
      await barbeiroApi.definirHorarios(faixas.map((f) => ({ ...f, abre: `${f.abre}:00`, fecha: `${f.fecha}:00` })))
      setOk('Horários salvos. A disponibilidade já segue as faixas novas.')
    } catch (e) {
      setErro(apiErrorMessage(e))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Secao
      titulo="Horário de atendimento"
      descricao="É daqui que saem os horários livres do link. Para o almoço, use duas faixas no mesmo dia."
    >
      {carregando && !dados ? (
        <Carregando className="py-6" />
      ) : erroCarregar && !dados ? (
        <ErroCarregar mensagem={erroCarregar} onTentar={recarregar} />
      ) : (
        <>
          <div className="flex flex-col divide-y divide-line-2">
            {diasDaSemana.map((d) => {
              const lista = doDia(d.valor)
              return (
                <div key={d.valor} className="flex items-start gap-3 py-2.5">
                  <div className="w-[64px] flex-none pt-2.5 text-[13px] font-semibold text-ink">{d.nome}</div>
                  <div className="flex flex-1 flex-col gap-2">
                    {lista.length === 0 && <span className="pt-2.5 text-[13px] text-muted-2">Fechado</span>}
                    {lista.map(({ f, i }) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <input
                          type="time"
                          aria-label={`${d.nome}: abre`}
                          value={f.abre}
                          onChange={(e) => mudar(i, 'abre', e.target.value)}
                          className="h-10 w-[104px] rounded-field border-[1.5px] border-input-border bg-surface px-2 text-[14px] text-ink outline-none focus:border-ink"
                        />
                        <span className="text-muted">–</span>
                        <input
                          type="time"
                          aria-label={`${d.nome}: fecha`}
                          value={f.fecha}
                          onChange={(e) => mudar(i, 'fecha', e.target.value)}
                          className="h-10 w-[104px] rounded-field border-[1.5px] border-input-border bg-surface px-2 text-[14px] text-ink outline-none focus:border-ink"
                        />
                        <button
                          onClick={() => remover(i)}
                          aria-label={`Remover faixa de ${d.nome}`}
                          className="flex h-8 w-8 items-center justify-center rounded-field text-[18px] text-muted hover:bg-screen hover:text-danger"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => adicionar(d.valor)}
                    className="flex-none pt-2.5 text-[11.5px] font-semibold uppercase tracking-[0.4px] text-brand"
                  >
                    + Faixa
                  </button>
                </div>
              )
            })}
          </div>
          <Button className="mt-3 w-full" loading={salvando} onClick={salvar}>
            Salvar horários
          </Button>
          <Retorno ok={ok} erro={erro} />
        </>
      )}
    </Secao>
  )
}

/* --------------------------------- Bloqueios -------------------------------- */
const amanha = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toISODate(d)
}

const diaSeguinte = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return toISODate(d)
}

const formatPeriodo = (b: Bloqueio) => {
  const ini = new Date(b.inicio)
  const fim = new Date(b.fim)
  const data = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const meiaNoite = (d: Date) => d.getHours() === 0 && d.getMinutes() === 0
  if (meiaNoite(ini) && meiaNoite(fim)) {
    const ultimo = new Date(fim)
    ultimo.setDate(ultimo.getDate() - 1)
    return toISODate(ultimo) === toISODate(ini) ? `${data(ini)} · dia inteiro` : `${data(ini)} a ${data(ultimo)}`
  }
  if (toISODate(ini) === toISODate(fim)) return `${data(ini)} · ${formatTime(b.inicio)}–${formatTime(b.fim)}`
  return `${data(ini)} ${formatTime(b.inicio)} a ${data(fim)} ${formatTime(b.fim)}`
}

function SecaoBloqueios() {
  const { dados, setDados, erro: erroCarregar, carregando, recarregar } = useCarregar(barbeiroApi.bloqueios)
  const [diaInteiro, setDiaInteiro] = useState(true)
  const [de, setDe] = useState(amanha)
  const [ate, setAte] = useState(amanha)
  const [horaDe, setHoraDe] = useState('14:00')
  const [horaAte, setHoraAte] = useState('15:00')
  const [motivo, setMotivo] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const bloquear = async () => {
    const inicio = diaInteiro ? `${de}T00:00:00` : `${de}T${horaDe}:00`
    const fim = diaInteiro ? `${diaSeguinte(ate < de ? de : ate)}T00:00:00` : `${de}T${horaAte}:00`
    setSalvando(true)
    setOk(null)
    setErro(null)
    try {
      const novo = await barbeiroApi.bloquear({ inicio, fim, motivo: motivo.trim() || undefined })
      setDados((prev) => [...(prev ?? []), novo].sort((a, b) => a.inicio.localeCompare(b.inicio)))
      setMotivo('')
      setOk(
        novo.agendamentosNoPeriodo > 0
          ? `Bloqueado. Atenção: ${novo.agendamentosNoPeriodo} agendamento(s) já marcados caem nesse período — remarque pela agenda.`
          : 'Bloqueado. Esses horários saíram do seu link.',
      )
    } catch (e) {
      setErro(apiErrorMessage(e))
    } finally {
      setSalvando(false)
    }
  }

  const remover = async (b: Bloqueio) => {
    setErro(null)
    try {
      await barbeiroApi.desbloquear(b.id)
      setDados((prev) => (prev ?? []).filter((x) => x.id !== b.id))
    } catch (e) {
      setErro(apiErrorMessage(e))
    }
  }

  const lista = dados ?? []

  return (
    <Secao titulo="Bloqueios" descricao="Folga, feriado, férias ou uma hora fechada: some do link, ninguém agenda.">
      {carregando && !dados ? (
        <Carregando className="py-6" />
      ) : erroCarregar && !dados ? (
        <ErroCarregar mensagem={erroCarregar} onTentar={recarregar} />
      ) : (
        <>
          {lista.length > 0 && (
            <div className="mb-4 flex flex-col gap-2">
              {lista.map((b) => (
                <div key={b.id} className="flex items-center gap-3 rounded-field border border-line bg-screen px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold text-ink">{formatPeriodo(b)}</div>
                    {b.motivo && <div className="truncate text-[12px] text-muted">{b.motivo}</div>}
                  </div>
                  <button
                    onClick={() => remover(b)}
                    className="text-[11.5px] font-semibold uppercase tracking-[0.4px] text-danger"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="mb-3 flex items-center gap-2 text-[13.5px] text-ink">
            <input type="checkbox" checked={diaInteiro} onChange={(e) => setDiaInteiro(e.target.checked)} />
            Dia(s) inteiro(s)
          </label>
          <div className="mb-3 flex gap-2">
            <Input label={diaInteiro ? 'De' : 'Dia'} type="date" className="flex-1" value={de} onChange={(e) => setDe(e.target.value)} />
            {diaInteiro ? (
              <Input label="Até" type="date" className="flex-1" value={ate} onChange={(e) => setAte(e.target.value)} />
            ) : (
              <>
                <Input label="Das" type="time" className="w-[110px]" value={horaDe} onChange={(e) => setHoraDe(e.target.value)} />
                <Input label="Às" type="time" className="w-[110px]" value={horaAte} onChange={(e) => setHoraAte(e.target.value)} />
              </>
            )}
          </div>
          <Input
            label="Motivo (opcional)"
            placeholder="Ex: feriado, médico, férias"
            maxLength={120}
            className="mb-3"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
          <Button variant="secondary" className="w-full" loading={salvando} disabled={!de} onClick={bloquear}>
            Bloquear
          </Button>
          <Retorno ok={ok} erro={erro} />
        </>
      )}
    </Secao>
  )
}

/* ---------------------------------- Página ---------------------------------- */
export function PerfilPage() {
  const { logout } = useAuth()
  const { dados: perfil, setDados, erro, carregando, recarregar } = useCarregar(barbeiroApi.perfil)
  const isDesktop = useIsDesktop()

  const conteudo = !perfil ? (
    carregando ? (
      <Carregando />
    ) : (
      <ErroCarregar mensagem={erro ?? 'Não foi possível carregar.'} onTentar={recarregar} />
    )
  ) : (
    <div className="flex max-w-[640px] flex-col gap-4">
      <SecaoBarbearia perfil={perfil} onSalvo={setDados} />
      <SecaoLink perfil={perfil} onSalvo={setDados} />
      <SecaoHorarios />
      <SecaoBloqueios />
      <Card className="flex items-center justify-between p-5">
        <div>
          <div className="text-[16px] font-semibold text-ink">Plano</div>
          <div className="text-[12.5px] text-muted">Assinatura, cartão ou Pix.</div>
        </div>
        <Link to="/barbeiro/plano" className="text-[12px] font-semibold uppercase tracking-[0.5px] text-brand">
          Ver plano ›
        </Link>
      </Card>
      {!isDesktop && (
        <Button variant="destructiveOutline" className="w-full" onClick={logout}>
          Sair de todos os aparelhos
        </Button>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <PanelShell>
        <h2 className="mb-1 text-[26px] font-medium text-ink">Perfil</h2>
        {perfil && <p className="mb-6 text-[13.5px] text-muted">{perfil.nome} · {perfil.email}</p>}
        {conteudo}
      </PanelShell>
    )
  }

  return (
    <AppShell withNav>
      <div className="flex-none px-[22px] pb-3 pt-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">Configurações</div>
        <h1 className="m-0 mt-0.5 text-[22px] font-medium text-ink">Perfil</h1>
        {perfil && <p className="m-0 mt-1 text-[12.5px] text-muted">{perfil.nome} · {perfil.email}</p>}
      </div>
      <div className="flex flex-1 flex-col px-[22px] pb-6">{conteudo}</div>
    </AppShell>
  )
}
