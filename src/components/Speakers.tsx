import { useState } from 'react'
import { SECTORS, speakers2024, type Sector } from '../data/content'
import { delay } from '../lib/hooks'
import { SectionHead } from './Head'
import { Ph } from './Ph'

const ORDER: Sector[] = ['ind', 'gov', 'aca', 'ong']

/** 2027 em montagem (espaços numerados); 2024 agrupado por setor, um nome por linha. */
export function Speakers() {
  const [tab, setTab] = useState<'2027' | '2024'>('2027')
  const orgs = new Set(speakers2024.map(x => x.org)).size

  return (
    <section id="palestrantes" data-chapter data-bg="#0b2440" data-ink="#f2f9fb" className="bg-ink text-paper" aria-labelledby="pal-h">
      <div className="wrap sec-pad">
        <SectionHead id="pal-h" title="Palestrantes" lead="A grade de 2027 está em montagem. Enquanto isso, veja quem falou na primeira edição, da operação à academia." />

        <div role="tablist" aria-label="Edição" className="mt-block inline-flex rounded-full bg-navy p-1">
          {(['2027', '2024'] as const).map(t => (
            <button
              key={t}
              role="tab"
              type="button"
              id={`tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`pal-${t}`}
              onClick={() => setTab(t)}
              className={`min-h-[44px] rounded-full px-5 font-medium transition-colors duration-200 ${tab === t ? 'bg-paper text-ink' : 'text-paper hover:text-sky'}`}
            >
              {t === '2027' ? 'Edição 2027' : 'Edição 2024'}
            </button>
          ))}
        </div>

        {tab === '2027' ? (
          <ol id="pal-2027" role="tabpanel" aria-labelledby="tab-2027" className="mt-8 grid gap-x-10 gap-y-5 md:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="t-intro" data-reveal style={delay(i % 2)}>
                <Ph id={`pal-${i + 1}`} />
              </li>
            ))}
          </ol>
        ) : (
          <div id="pal-2024" role="tabpanel" aria-labelledby="tab-2024" className="mt-8">
            <p className="t-body text-sky tnum">{speakers2024.length} palestrantes de {orgs} instituições. Primeira edição, São Luís, outubro de 2024.</p>
            <div className="mt-8 grid gap-x-12 gap-y-14 md:grid-cols-2">
              {ORDER.map(sec => {
                const list = speakers2024.filter(s => s.sector === sec)
                return (
                  <section key={sec} aria-labelledby={`sec-${sec}`}>
                    <h3 id={`sec-${sec}`} className="t-item flex items-baseline gap-3">
                      <i className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SECTORS[sec].color }} aria-hidden="true" />
                      {SECTORS[sec].label}
                      <span className="t-small font-medium text-sky tnum">{list.length}</span>
                    </h3>
                    <ul className="mt-4 grid gap-4">
                      {list.map(s => (
                        <li key={s.name}>
                          <p className="t-body font-medium">{s.name} <span className="text-sky">· {s.org}</span></p>
                          <p className="t-small mt-0.5 text-foam">{s.talk}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
