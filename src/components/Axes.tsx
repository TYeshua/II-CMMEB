import { delay } from '../lib/hooks'
import { SectionHead } from './Head'
import { Ph } from './Ph'

/** Eixos temáticos: a lista oficial ainda não existe, cada eixo tem seu espaço numerado. */
export function Axes() {
  return (
    <section id="eixos" data-chapter data-bg="#c4352a" data-ink="#f2f9fb" className="bg-guara-field text-paper" aria-labelledby="eixos-h">
      <div className="wrap sec-pad">
        <SectionHead
          id="eixos-h"
          title="Eixos temáticos"
          lead="Os eixos orientam a submissão de trabalhos e a montagem das sessões. A lista oficial sai com a abertura das submissões."
        />
        <div className="grid12 mt-block items-start gap-y-6">
          {/* o eixo central é o único destacado */}
          <div className="col-span-12 rounded-[12px] bg-sun p-6 text-ink lg:col-span-5" data-reveal>
            <h3 className="t-sub">Óleo e gás na Margem Equatorial</h3>
            <p className="t-small mt-2 font-medium">Eixo central do congresso</p>
            <p className="t-body mt-4"><Ph id="eixo-central" label="Ementa do eixo central" /></p>
          </div>
          <ol className="col-span-12 grid content-start gap-x-8 gap-y-4 sm:grid-cols-2 lg:col-span-7 lg:pl-4">
            {Array.from({ length: 7 }, (_, i) => (
              <li key={i} className="t-body" data-reveal style={delay(i * 0.4)}>
                <Ph id={`eixo-${i + 1}`} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
