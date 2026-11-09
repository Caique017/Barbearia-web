import { Link } from 'react-router-dom'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Checkbox } from '../ui'

interface AceiteTermosProps {
  termos: UseFormRegisterReturn
  marketing: UseFormRegisterReturn
  erro?: string
}

const link = 'font-semibold text-brand underline-offset-2 hover:underline'

/** Os dois aceites do cadastro: termos (obrigatório) e novidades (opcional, desmarcado). */
export function AceiteTermos({ termos, marketing, erro }: AceiteTermosProps) {
  return (
    <div className="mt-1 flex flex-col gap-2.5">
      <Checkbox error={erro} {...termos}>
        Tenho 18 anos ou mais e li e aceito os{' '}
        <Link to="/termos" target="_blank" rel="noopener" className={link}>
          Termos de Uso
        </Link>{' '}
        e a{' '}
        <Link to="/privacidade" target="_blank" rel="noopener" className={link}>
          Política de Privacidade
        </Link>
        .
      </Checkbox>
      <Checkbox {...marketing}>
        Quero receber novidades do ClipBook por e-mail (opcional, dá para cancelar quando quiser).
      </Checkbox>
    </div>
  )
}
