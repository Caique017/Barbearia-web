import { useCallback, useEffect, useRef, useState } from 'react'
import { apiErrorMessage } from '../api/axios'

/**
 * Busca dados ao montar e sempre que `deps` mudarem (comparadas por valor).
 * Respostas que chegam depois de uma troca de `deps` são descartadas.
 */
export function useCarregar<T>(buscar: () => Promise<T>, deps: unknown[] = []) {
  const [dados, setDados] = useState<T | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [versao, setVersao] = useState(0)

  // A função muda a cada render; quem decide quando buscar de novo são as deps.
  const buscarRef = useRef(buscar)
  useEffect(() => {
    buscarRef.current = buscar
  })

  const chave = JSON.stringify(deps)

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setErro(null)
    buscarRef
      .current()
      .then((d) => {
        if (ativo) setDados(d)
      })
      .catch((e) => {
        if (ativo) setErro(apiErrorMessage(e))
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [chave, versao])

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])

  return { dados, setDados, erro, carregando, recarregar }
}
