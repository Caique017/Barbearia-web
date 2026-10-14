import { useEffect, useState } from 'react'

/** Assina uma media query e retorna se ela casa no momento. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** `true` a partir de 1024px (breakpoint lg do Tailwind) — layout desktop. */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}
