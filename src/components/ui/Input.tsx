import { forwardRef, useId, useState } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = '', type, ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  // Todo type="password" ganha o botão de ver/ocultar — sem mudar quem usa o Input.
  const ehSenha = type === 'password'
  const [visivel, setVisivel] = useState(false)

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.4px] text-muted"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={ehSenha && visivel ? 'text' : type}
          className={`h-[46px] w-full rounded-field border-[1.5px] bg-surface text-[15px] text-ink outline-none transition-colors duration-150 placeholder:text-placeholder focus:border-ink ${
            ehSenha ? 'pl-[13px] pr-[44px]' : 'px-[13px]'
          } ${error ? 'border-danger' : 'border-input-border'}`}
          {...rest}
        />
        {ehSenha && (
          <button
            type="button"
            onClick={() => setVisivel((v) => !v)}
            aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
            title={visivel ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-0 top-0 flex h-[46px] w-[44px] cursor-pointer items-center justify-center text-muted-2 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M2 12s3.6-6.5 10-6.5 10 6.5 10 6.5-3.6 6.5-10 6.5S2 12 2 12z" />
              <circle cx="12" cy="12" r="2.6" />
              {visivel && <path d="M4 20 20 4" />}
            </svg>
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-[12px] text-danger">{error}</p>}
    </div>
  )
})
