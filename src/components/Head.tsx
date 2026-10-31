import type { ReactNode } from 'react'
import { delay } from '../lib/hooks'
import { OrbitMark, type Ring } from './OrbitMark'

/**
 * Abertura de seção, igual em todos os cards: título à esquerda e, ao lado, uma frase de entrada.
 * As três seções do tema (indústria, margem, ambiente) levam o sinal da órbita.
 */
export function SectionHead({ id, title, lead, mark, markClass = 'text-sea' }: { id: string; title: ReactNode; lead?: ReactNode; mark?: Ring; markClass?: string }) {
  return (
    <div className="grid12 items-end gap-y-4">
      <div className={`col-span-12 flex items-start gap-4 md:gap-5 ${lead ? 'lg:col-span-7' : ''}`} data-reveal>
        {mark && <OrbitMark active={mark} className={`mt-1 w-11 md:w-14 ${markClass}`} />}
        <h2 id={id} className="t-head">{title}</h2>
      </div>
      {lead && <p className="t-intro col-span-12 max-w-[40ch] lg:col-span-5" data-reveal style={delay(1)}>{lead}</p>}
    </div>
  )
}
