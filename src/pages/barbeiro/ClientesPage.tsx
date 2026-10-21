import { useMemo, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { PanelShell } from '../../components/layout/PanelShell'
import { Button, Carregando, ErroCarregar, Input, Modal, Vazio } from '../../components/ui'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { useCarregar } from '../../hooks/useCarregar'
import { carteiraApi } from '../../api/carteira'
import { apiErrorMessage } from '../../api/axios'
import type { Cliente } from '../../types'
import { formatTelefone, initials } from '../../utils/formatters'

const digitos = (s: string) => s.replace(/\D/g, '')
/** Espelha Telefone.PADRAO da API: DDD + 8 ou 9 dígitos. */
const telefoneValido = (s: string) => /^[1-9]{2}9?\d{8}$/.test(digitos(s))

export function ClientesPage() {
  const { dados, setDados, erro, carregando, recarregar } = useCarregar(carteiraApi.listar)
  const clientes = useMemo(() => dados ?? [], [dados])
  const [busca, setBusca] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [erroLista, setErroLista] = useState<string | null>(null)

  const pedidos = clientes.filter((c) => c.pedidoVinculo)
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return clientes
    return clientes.filter(
      (c) => c.nome.toLowerCase().includes(termo) || (digitos(termo) !== '' && c.telefone.includes(digitos(termo))),
    )
  }, [busca, clientes])

  const trocar = (c: Cliente) => setDados((prev) => (prev ?? []).map((x) => (x.id === c.id ? c : x)))

  const abrirNovo = () => {
    setEditando(null)
    setNome('')
    setTelefone('')
    setErroForm(null)
    setModalOpen(true)
  }

  const abrirEdicao = (c: Cliente) => {
    setEditando(c)
    setNome(c.nome)
    setTelefone(formatTelefone(c.telefone))
    setErroForm(null)
    setModalOpen(true)
  }

  const salvar = async () => {
    if (!nome.trim()) return setErroForm('Informe o nome.')
    if (!telefoneValido(telefone)) return setErroForm('Telefone inválido. Informe DDD + número.')
    setSalvando(true)
    setErroForm(null)
    try {
      const corpo = { nome: nome.trim(), telefone: digitos(telefone) }
      if (editando) {
        trocar(await carteiraApi.atualizar(editando.id, corpo))
      } else {
        const novo = await carteiraApi.cadastrar(corpo)
        setDados((prev) => [novo, ...(prev ?? [])])
      }
      setModalOpen(false)
    } catch (e) {
      setErroForm(apiErrorMessage(e))
    } finally {
      setSalvando(false)
    }
  }

  const decidirVinculo = async (c: Cliente, aprovar: boolean) => {
    setOcupado(c.id)
    setErroLista(null)
    try {
      if (aprovar) {
        trocar(await carteiraApi.aprovarVinculo(c.id))
      } else {
        await carteiraApi.recusarVinculo(c.id)
        trocar({ ...c, pedidoVinculo: null })
      }
    } catch (e) {
      setErroLista(apiErrorMessage(e))
    } finally {
      setOcupado(null)
    }
  }

  const modal = (
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar cliente' : 'Novo cliente'}>
      <div className="flex flex-col gap-3">
        <Input label="Nome" placeholder="Nome do cliente" maxLength={100} value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input
          label="WhatsApp"
          type="tel"
          placeholder="(11) 9 8888-7777"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        {editando?.temConta && (
          <p className="m-0 text-[12px] leading-relaxed text-muted">
            Este cliente tem conta no ClipBook — o e-mail e a senha são dele e não mudam por aqui.
          </p>
        )}
        {erroForm && <p className="m-0 text-[13px] text-danger">{erroForm}</p>}
        <Button className="mt-1 w-full" loading={salvando} onClick={salvar}>
          {editando ? 'Salvar alterações' : 'Cadastrar cliente'}
        </Button>
      </div>
    </Modal>
  )

  const blocoPedidos = pedidos.length > 0 && (
    <div className="mb-5">
      <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.7px] text-alert">
        Pedidos de vínculo · {pedidos.length}
      </div>
      <div className="flex flex-col gap-2.5">
        {pedidos.map((c) => (
          <div key={c.id} className="rounded-card border border-line border-l-4 border-l-alert bg-surface p-4 shadow-card">
            <p className="m-0 text-[13.5px] leading-relaxed text-ink-2">
              <span className="font-semibold text-ink">{c.pedidoVinculo!.nome}</span> ({c.pedidoVinculo!.email}) criou
              conta pelo seu link com o telefone de <span className="font-semibold text-ink">{c.nome}</span>.
              Aprovar junta os dois: o histórico continua e ele passa a agendar sozinho.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" loading={ocupado === c.id} onClick={() => decidirVinculo(c, true)}>
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="destructiveOutline"
                disabled={ocupado === c.id}
                onClick={() => decidirVinculo(c, false)}
              >
                Recusar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const campoBusca = (
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
  )

  const lista =
    carregando && !dados ? (
      <Carregando />
    ) : erro && !dados ? (
      <ErroCarregar mensagem={erro} onTentar={recarregar} />
    ) : clientes.length === 0 ? (
      <Vazio
        icone="👥"
        titulo="Sua carteira está vazia"
        dica="Cadastre clientes aqui ou mande seu link — quem criar conta por ele entra sozinho."
      />
    ) : filtrados.length === 0 ? (
      <p className="text-[13px] text-muted">Nenhum cliente encontrado.</p>
    ) : (
      <div className="flex flex-col gap-2.5">
        {filtrados.map((c) => (
          <button
            key={c.id}
            onClick={() => abrirEdicao(c)}
            className="flex items-center gap-3 rounded-card border border-line bg-surface p-3 text-left shadow-card transition-colors hover:border-input-border"
          >
            <div className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-lg bg-brand-tint text-[14px] font-bold text-brand">
              {initials(c.nome)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px] font-semibold text-ink">{c.nome}</div>
              <div className="text-[12px] text-muted">{formatTelefone(c.telefone)}</div>
            </div>
            {c.temConta && (
              <span className="rounded-lg bg-brand-tint-2 px-2 py-[3px] text-[10px] font-bold text-brand-hover">
                Tem conta
              </span>
            )}
            <span className="text-[14px] text-muted-2">›</span>
          </button>
        ))}
      </div>
    )

  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <PanelShell>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[26px] font-medium text-ink">Clientes</h2>
          <Button className="h-11 px-5" onClick={abrirNovo}>
            + Novo cliente
          </Button>
        </div>
        <div className="max-w-[640px]">
          {erroLista && <p className="mb-3 text-[13px] text-danger">{erroLista}</p>}
          {blocoPedidos}
          {clientes.length > 0 && campoBusca}
          {lista}
        </div>
        {modal}
      </PanelShell>
    )
  }

  return (
    <AppShell withNav>
      <div className="flex flex-none items-center justify-between px-[22px] pb-3 pt-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">Carteira</div>
          <h1 className="m-0 mt-0.5 text-[22px] font-medium text-ink">Clientes</h1>
        </div>
        <span className="rounded-lg border border-line bg-surface px-2.5 py-[5px] text-[12px] text-muted">
          {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-[22px] pb-4">
        {erroLista && <p className="mb-2 text-[13px] text-danger">{erroLista}</p>}
        {blocoPedidos}
        {clientes.length > 0 && campoBusca}
        {lista}
        <Button className="mt-5 w-full" onClick={abrirNovo}>
          + Novo cliente
        </Button>
      </div>
      {modal}
    </AppShell>
  )
}
