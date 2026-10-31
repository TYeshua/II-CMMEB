import type { CSSProperties } from 'react'
import { LENS, zones } from '../data/content'
import { delay } from '../lib/hooks'
import { SectionHead } from './Head'
import { ProfileArt } from './ProfileArt'

// cada faixa de profundidade escurece o card: da costa clara à bacia oceânica
const THEME: Record<string, { bg: string; ink: string; water: string; bed: string; a: string; u: string; soft: string }> = {
  costa: { bg: '#8fd3e8', ink: '#0b2440', water: '#2a9fbd', bed: '#0b2440', a: '#0b2440', u: '#f2f9fb', soft: '#0c4d79' },
  plataforma: { bg: '#2a9fbd', ink: '#0b2440', water: '#1b6ba3', bed: '#0b2440', a: '#0b2440', u: '#cdeef5', soft: '#06223d' },
  talude: { bg: '#1b6ba3', ink: '#f2f9fb', water: '#0c4d79', bed: '#06142a', a: '#f2f9fb', u: '#8fd3e8', soft: '#cdeef5' },
  bacia: { bg: '#0c4d79', ink: '#f2f9fb', water: '#0a3253', bed: '#06142a', a: '#f2f9fb', u: '#8fd3e8', soft: '#cdeef5' },
}

export function Transect() {
  return (
    <section id="margem" aria-labelledby="margem-h">
      <div data-chapter data-bg="#8fd3e8" data-ink="#0b2440" className="bg-sky text-ink">
        <div className="wrap sec-pad pb-0!">
          <SectionHead id="margem-h" mark="margem" title="Ao redor, a margem" lead="O território onde a indústria opera, da costa à bacia oceânica." />
        </div>
      </div>
      {zones.map((z, i) => {
        const t = THEME[z.id]
        const style = {
          '--i': i, background: t.bg, color: t.ink,
          '--water': t.water, '--bed': t.bed, '--ink-a': t.a, '--ink-u': t.u,
        } as CSSProperties
        return (
          <article key={z.id} className="zone" style={style} data-chapter data-bg={t.bg} data-ink={t.ink} aria-labelledby={`z-${z.id}`}>
            <div className="wrap grid12 items-start gap-y-6">
              <div className="col-span-12 md:col-span-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 id={`z-${z.id}`} className="t-sub">{z.name}</h3>
                  <span className="t-small tnum shrink-0 font-medium md:text-[length:var(--step-body)]">{z.depth}</span>
                </div>
                <p className="t-intro mt-4" data-reveal>{z.text}</p>
                <ul className="mt-6 grid gap-5">
                  {z.spots.map((s, k) => (
                    <li key={s.name} data-reveal style={delay(k + 1)}>
                      <h4 className="t-item">{s.name}</h4>
                      <p className="t-body mt-1">{s.text}</p>
                      <p className="t-small mt-1.5 font-medium" style={{ color: t.soft }}>{s.lens.map(l => LENS[l]).join(' e ')}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative col-span-12 min-h-[200px] self-stretch md:col-span-6">
                <ProfileArt crop={z.crop} className="h-full w-full md:absolute md:inset-0" />
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
