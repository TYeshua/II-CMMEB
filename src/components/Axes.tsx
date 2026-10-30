import { delay } from '../lib/hooks'
import { Ph } from './Ph'

/** Eixos temáticos: a lista oficial ainda não existe, cada eixo tem seu espaço numerado. */
export function Axes() {
  return (
    <section id="eixos" data-chapter data-bg="#c4352a" data-ink="#f2f9fb" className="bg-guara-field text-paper" aria-labelledby="eixos-h">
      <div className="wrap grid12 gap-y-10 py-[clamp(48px,8vw,140px)]">
        <div className="col-span-12 lg:col-span-5">
          <h2 id="eixos-h" className="t-head" data-reveal>Eixos temáticos</h2>
          <p className="t-body mt-5 max-w-[44ch]" data-reveal style={delay(1)}>
            Os eixos orientam a submissão de trabalhos e a montagem das sessões. A lista oficial sai com a abertura das submissões.
          </p>
        </div>
        <ol className="col-span-12 grid content-start gap-2 lg:col-span-7">
          <li className="bg-sun p-6 text-ink md:p-8" data-reveal>
            <span className="fs-lead block font-black leading-tight">Óleo e gás na Margem Equatorial</span>
            <span className="t-small mt-1 block font-medium">Eixo central do congresso</span>
            <span className="t-body mt-3 block"><Ph id="eixo-central" label="Ementa do eixo central" /></span>
          </li>
          {Array.from({ length: 7 }, (_, i) => (
            <li key={i} className="bg-ink p-5 md:px-8" data-reveal style={delay(i * 0.5)}>
              <span className="t-body block"><Ph id={`eixo-${i + 1}`} /></span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
