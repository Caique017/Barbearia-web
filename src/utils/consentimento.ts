const CHAVE = 'clipbook:consentimento'

export type Consentimento = 'aceito' | 'recusado'

export function lerConsentimento(): Consentimento | null {
  try {
    const valor = localStorage.getItem(CHAVE)
    return valor === 'aceito' || valor === 'recusado' ? valor : null
  } catch {
    return null
  }
}

export function salvarConsentimento(valor: Consentimento) {
  try {
    localStorage.setItem(CHAVE, valor)
  } catch {
    return
  }
}

/** Só carregue qualquer recurso opcional (estatística, marketing) se isto for `true`. */
export function aceitouOpcionais() {
  return lerConsentimento() === 'aceito'
}
