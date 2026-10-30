import type { CSSProperties } from 'react'
import { LENS, zones } from '../data/content'
import { delay } from '../lib/hooks'
import { OrbitMark } from './OrbitMark'
import { ProfileArt } from './ProfileArt'

const THEME: Record<string, { bg: string; ink: string; water: string; bed: string; a: string; u: string; soft: string }> = {
  costa: { bg: '#8fd3e8', ink: '#0b2440', water: '#2a9fbd', bed: '#0b2440', a: '#0b2440', u: '#f2f9fb', soft: '#0c4d79' },
  plataforma: { bg: '#2a9fbd', ink: '#0b2440', water: '#1b6ba3', bed: '#0b2440', a: '#0b2440', u: '#cdeef5', soft: '#06223d' },
  talude: { bg: '#1b6ba3', ink: '#f2f9fb', water: '#0c4d79', bed: '#06142a', a: '#f2f9fb', u: '#8fd3e8', soft: '#cdeef5' },
  bacia: { bg: '#0c4d79', ink: '#f2f9fb', water: '#0a3253', bed: '#06142a', a: '#f2f9fb', u: '#8fd3e8', soft: '#cdeef5' },
}

export function Transect() {
  return (
    <section id="margem" aria-labelledby="margem-h">
      <div data-chapter data-bg="#f2f9fb" data-ink="#0b2440" className="bg-paper text-ink">
        <div className="wrap grid12 gap-y-6 pt-[clamp(48px,8vw,140px)] pb-[clamp(48px,7vh,88px)]">
          <div className="col-span-12 flex items-start gap-5 md:col-span-7" data-reveal>
            <OrbitMark active="margem" className="mt-1 w-12 text-sea md:w-16" />
            <h2 id="margem-h" className="t-head">Ao redor, a margem</h2>
          </div>
          <p className="t-lead col-span-12 md:col-span-5 md:self-end" data-reveal style={delay(1)}>
            O território onde a indústria opera, da costa à bacia oceânica.
          </p>
        </div>
      </div>
      <div className="relative">
        {zones.map((z, i) => {
          const t = THEME[z.id]
          const style = {
            '--i': i, background: t.bg, color: t.ink,
            '--water': t.water, '--bed': t.bed, '--ink-a': t.a, '--ink-u': t.u,
          } as CSSProperties
          return (
            <article key={z.id} className="sheet flex flex-col" style={style} data-chapter data-bg={t.bg} data-ink={t.ink} aria-labelledby={`z-${z.id}`}>
              <div className="wrap flex shrink-0 items-baseline justify-between gap-4 pt-[clamp(48px,7vw,112px)]">
                <h3 id={`z-${z.id}`} className="t-head">{z.name}</h3>
                <span className="tnum fs-lead font-medium">{z.depth}</span>
              </div>
              <div className="wrap grid12 flex-1 gap-y-8 pb-[clamp(48px,8vw,128px)] pt-6 md:pt-10">
                <div className="col-span-12 flex flex-col md:col-span-6">
                  <p className="t-lead" data-reveal>{z.text}</p>
                  <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                    {z.spots.map((s, k) => (
                      <li key={s.name} data-reveal style={delay(k + 1)}>
                        <h4 className="fs-lead font-black leading-tight tracking-tight">{s.name}</h4>
                        <p className="t-body mt-1">{s.text}</p>
                        <p className="t-small mt-2 font-medium" style={{ color: t.soft }}>{s.lens.map(l => LENS[l]).join(' e ')}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative col-span-12 min-h-[240px] md:col-span-6 md:col-start-7">
                  <ProfileArt crop={z.crop} className="h-full w-full md:absolute md:inset-0" />
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
