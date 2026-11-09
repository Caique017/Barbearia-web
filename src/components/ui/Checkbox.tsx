import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children: ReactNode
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { children, error, id, className = '', ...rest },
  ref,
) {
  const geradoId = useId()
  const inputId = id ?? geradoId
  const erroId = `${inputId}-erro`

  return (
    <div className={className}>
      <div className="flex items-start gap-2.5">
        <input
          id={inputId}
          ref={ref}
          type="checkbox"
          aria-invalid={!!error}
          aria-describedby={error ? erroId : undefined}
          className="mt-[2px] h-[18px] w-[18px] flex-none cursor-pointer accent-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          {...rest}
        />
        <label htmlFor={inputId} className="cursor-pointer text-[13px] leading-snug text-ink-2">
          {children}
        </label>
      </div>
      {error && (
        <p id={erroId} className="mt-1.5 text-[12px] text-danger">
          {error}
        </p>
      )}
    </div>
  )
})
