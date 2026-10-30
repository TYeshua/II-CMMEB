import { ph } from '../data/content'

/** Espaço reservado numerado: [n] o que entra aqui. A numeração vem de PLACEHOLDERS. */
export function Ph({ id, label, className = '' }: { id: string; label?: string; className?: string }) {
  const p = ph(id)
  return (
    <span className={`ph ${className}`} data-ph={p.n}>
      <b className="tnum">[{p.n}]</b> {label ?? p.label}
    </span>
  )
}

/** Só o número, para usos em tamanho grande. */
export function PhNum({ id, className = '' }: { id: string; className?: string }) {
  const p = ph(id)
  return <span className={`tnum ${className}`} data-ph={p.n} aria-label={`Espaço ${p.n}: ${p.label}`}>[{p.n}]</span>
}
