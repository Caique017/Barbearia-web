import { useCallback, useEffect, useRef, useState } from 'react'
import { apiErrorMessage } from '../api/axios'

/**
 * Busca dados ao montar e sempre que `deps` mudarem (comparadas por valor).
 * Respostas que chegam depois de uma troca de `deps` são descartadas.
 * Enquanto a nova busca não volta, `dados` mantém o resultado anterior.
 */
export function useCarregar<T>(buscar: () => Promise<T>, deps: unknown[] = []) {
  const [dados, setDados] = useState<T | null>(null)
  // Qual busca já respondeu e com que erro: "carregando" é derivado disso.
  const [resposta, setResposta] = useState<{ id: string; erro: string | null } | null>(null)
  const [versao, setVersao] = useState(0)

  // A função muda a cada render; quem decide quando buscar de novo são as deps.
  const buscarRef = useRef(buscar)
  useEffect(() => {
    buscarRef.current = buscar
  })

  const id = `${JSON.stringify(deps)}#${versao}`

  useEffect(() => {
    let ativo = true
    buscarRef
      .current()
      .then((d) => {
        if (!ativo) return
        setDados(d)
        setResposta({ id, erro: null })
      })
      .catch((e) => {
        if (ativo) setResposta({ id, erro: apiErrorMessage(e) })
      })
    return () => {
      ativo = false
    }
  }, [id])

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])
  const respondida = resposta?.id === id

  return {
    dados,
    setDados,
    erro: respondida ? resposta.erro : null,
    carregando: !respondida,
    recarregar,
  }
}
