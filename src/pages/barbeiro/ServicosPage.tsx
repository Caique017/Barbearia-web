import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { PanelShell } from '../../components/layout/PanelShell'
import { Button, Carregando, ErroCarregar, Input, Modal, Vazio } from '../../components/ui'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { useCarregar } from '../../hooks/useCarregar'
import { servicoApi } from '../../api/servico'
import { apiErrorMessage } from '../../api/axios'
import type { Servico } from '../../types'
import { formatCurrencyShort } from '../../utils/formatters'

interface FormState {
  nome: string
  preco: string
  duracaoMinutos: string
  custoInsumo: string
}

const emptyForm: FormState = { nome: '', preco: '', duracaoMinutos: '', custoInsumo: '' }

/** Aceita "45,90" e "45.90". */
const numero = (v: string) => Number(v.replace(',', '.'))

export function ServicosPage() {
  const { dados, setDados, erro: erroCarregar, carregando, recarregar } = useCarregar(servicoApi.listar)
  const servicos = dados ?? []
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Servico | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroLista, setErroLista] = useState<string | null>(null)

  const ativos = servicos.filter((s) => s.ativo).length

  const trocar = (atualizado: Servico) =>
    setDados((prev) => (prev ?? []).map((s) => (s.id === atualizado.id ? atualizado : s)))

  const alternarAtivo = async (s: Servico) => {
    setErroLista(null)
    // Otimista: o switch responde na hora; se a API recusar, volta.
    trocar({ ...s, ativo: !s.ativo })
    try {
      trocar(await servicoApi.atualizar(s.id, { ativo: !s.ativo }))
    } catch (e) {
      trocar(s)
      setErroLista(apiErrorMessage(e))
    }
  }

  const abrirNovo = () => {
    setEditando(null)
    setForm(emptyForm)
    setErro(null)
    setModalOpen(true)
  }

  const abrirEdicao = (s: Servico) => {
    setEditando(s)
    setForm({
      nome: s.nome,
      preco: String(s.preco),
      duracaoMinutos: String(s.duracaoMinutos),
      custoInsumo: String(s.custoInsumo),
    })
    setErro(null)
    setModalOpen(true)
  }

  const salvar = async () => {
    const preco = numero(form.preco)
    const duracao = Number(form.duracaoMinutos)
    const custo = form.custoInsumo.trim() === '' ? 0 : numero(form.custoInsumo)
    if (!form.nome.trim()) return setErro('Informe o nome do serviço.')
    if (form.preco.trim() === '' || !(preco >= 0)) return setErro('Informe um preço válido.')
    if (!Number.isInteger(duracao) || duracao < 5 || duracao > 480)
      return setErro('A duração vai de 5 a 480 minutos.')
    if (!(custo >= 0)) return setErro('O custo de insumo não pode ser negativo.')

    const corpo = { nome: form.nome.trim(), preco, duracaoMinutos: duracao, custoInsumo: custo }
    setSalvando(true)
    setErro(null)
    try {
      if (editando) {
        trocar(await servicoApi.atualizar(editando.id, corpo))
      } else {
        const novo = await servicoApi.criar(corpo)
        setDados((prev) => [...(prev ?? []), novo])
      }
      setModalOpen(false)
    } catch (e) {
      setErro(apiErrorMessage(e))
    } finally {
      setSalvando(false)
    }
  }

  const servicoModal = (
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar serviço' : 'Novo serviço'}>
      <div className="flex flex-col gap-3">
        <Input
          label="Nome"
          placeholder="Ex: Corte + Barba"
          maxLength={100}
          value={form.nome}
          onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
        />
        <div className="flex gap-2.5">
          <Input
            label="Preço (R$)"
            inputMode="decimal"
            placeholder="65"
            className="flex-1"
            value={form.preco}
            onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
          />
          <Input
            label="Duração (min)"
            type="number"
            inputMode="numeric"
            min={5}
            max={480}
            placeholder="45"
            className="flex-1"
            value={form.duracaoMinutos}
            onChange={(e) => setForm((f) => ({ ...f, duracaoMinutos: e.target.value }))}
          />
        </div>
        <Input
          label="Custo de insumo (R$)"
          inputMode="decimal"
          placeholder="5"
          value={form.custoInsumo}
          onChange={(e) => setForm((f) => ({ ...f, custoInsumo: e.target.value }))}
        />
        <p className="m-0 text-[12px] leading-relaxed text-muted">
          Mudar o preço não altera os agendamentos já marcados — eles guardam o preço da época.
        </p>
        {erro && <p className="m-0 text-[13px] text-danger">{erro}</p>}
        <Button className="mt-1 w-full" loading={salvando} onClick={salvar}>
          {editando ? 'Salvar alterações' : 'Criar serviço'}
        </Button>
      </div>
    </Modal>
  )

  const linha = (s: Servico) => (
    <>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold text-ink">{s.nome}</div>
        <div className="mt-0.5 text-[12px] text-muted">
          {s.duracaoMinutos} min · insumo {formatCurrencyShort(s.custoInsumo)}
        </div>
      </div>
      <div className="text-[15px] font-semibold text-ink">{formatCurrencyShort(s.preco)}</div>
      <button
        onClick={() => abrirEdicao(s)}
        aria-label={`Editar ${s.nome}`}
        className="flex h-8 w-8 items-center justify-center rounded-field border-[1.5px] border-line bg-surface hover:bg-screen"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3d3d3d" strokeWidth="2">
          <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
        </svg>
      </button>
      <button
        onClick={() => alternarAtivo(s)}
        role="switch"
        aria-checked={s.ativo}
        aria-label={`${s.ativo ? 'Desativar' : 'Ativar'} ${s.nome}`}
        className={`relative h-[26px] w-11 flex-none rounded-full transition-colors ${
          s.ativo ? 'bg-brand' : 'bg-input-border'
        }`}
      >
        <span
          className={`absolute left-0 top-0.5 h-[22px] w-[22px] rounded-full bg-white shadow transition-transform ${
            s.ativo ? 'translate-x-[20px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </>
  )

  const estado =
    carregando && !dados ? (
      <Carregando />
    ) : erroCarregar && !dados ? (
      <ErroCarregar mensagem={erroCarregar} onTentar={recarregar} />
    ) : servicos.length === 0 ? (
      <Vazio icone="✂️" titulo="Nenhum serviço ainda" dica="Cadastre o que você faz para os clientes poderem agendar." />
    ) : null

  const isDesktop = useIsDesktop()

  /* ------------------------------- Desktop (D8) ------------------------------ */
  if (isDesktop) {
    return (
      <PanelShell>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[26px] font-medium text-ink">Serviços</h2>
          <Button className="h-11 px-5" onClick={abrirNovo}>
            + Novo serviço
          </Button>
        </div>
        {erroLista && <p className="mb-3 text-[13px] text-danger">{erroLista}</p>}
        {estado ?? (
          <div className="max-w-[640px] rounded-card border border-line bg-surface px-5 shadow-card">
            {servicos.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 py-4 transition-opacity ${
                  i < servicos.length - 1 ? 'border-b border-line-2' : ''
                } ${s.ativo ? 'opacity-100' : 'opacity-50'}`}
              >
                {linha(s)}
              </div>
            ))}
          </div>
        )}
        {servicoModal}
      </PanelShell>
    )
  }

  /* -------------------------------- Mobile (2.7) ----------------------------- */
  return (
    <AppShell withNav>
      <div className="flex flex-none items-center justify-between px-[22px] pb-3 pt-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">Gestão</div>
          <h1 className="m-0 mt-0.5 text-[22px] font-medium text-ink">Serviços</h1>
        </div>
        <span className="rounded-lg border border-line bg-surface px-2.5 py-[5px] text-[12px] text-muted">
          {ativos} ativos
        </span>
      </div>

      <div className="flex flex-1 flex-col px-[22px] pb-4">
        {erroLista && <p className="mb-2 text-[13px] text-danger">{erroLista}</p>}
        {estado ??
          servicos.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 border-b border-line-2 py-[15px] transition-opacity ${
                s.ativo ? 'opacity-100' : 'opacity-50'
              }`}
            >
              {linha(s)}
            </div>
          ))}
        <Button className="mt-5 w-full" onClick={abrirNovo}>
          + Novo serviço
        </Button>
      </div>

      {servicoModal}
    </AppShell>
  )
}
