/** Marca do congresso: sol, mar em faixas, o arco do guará e a plataforma. */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 84 84" fill="none" aria-hidden="true" className={className}>
      <circle cx="56" cy="30" r="7" fill="#f5a524" />
      <path d="M8 44 A34 34 0 0 0 76 44 Z" fill="#1b6ba3" />
      <path d="M8 44 Q25 38 42 44 T76 44 L76 47 A34 34 0 0 1 75.3 50 Q58 46 42 50 T9 50 A34 34 0 0 1 8 47Z" fill="#8fd3e8" />
      <path d="M11 56 Q27 51 42 56 T73 56 A34 34 0 0 1 70 62 Q56 58 42 62 T14 62 A34 34 0 0 1 11 56Z" fill="#0c4d79" />
      <path d="M14 22 C24 10 36 12 44 24" stroke="#d33a2c" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M30 43 V28 M26 28 H36 M33 28 V20" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  )
}

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
