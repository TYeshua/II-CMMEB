import { delay } from '../lib/hooks'
import { SectionHead } from './Head'
import { Arrow } from './Logo'
import { Ph } from './Ph'

const STEPS: [string, string][] = [
  ['insc-abertura', 'Abertura das inscrições'],
  ['sub-prazo', 'Prazo de submissão'],
  ['resultado', 'Resultado da avaliação'],
  ['datas', 'Congresso em Salinópolis'],
]

/** A ação principal do site: um card só, com inscrição, submissão e o cronograma que as liga. */
export function Registration() {
  return (
    <section id="inscricoes" data-chapter data-bg="#f5a524" data-ink="#0b2440" className="bg-sun text-ink" aria-labelledby="insc-h">
      <div className="wrap sec-pad">
        <SectionHead id="insc-h" title="Inscrições" lead="Para participar do congresso, com ou sem trabalho apresentado." />

        <div className="grid12 mt-block items-start gap-y-10">
          <div className="col-span-12 md:col-span-6" data-reveal>
            <h3 className="t-sub">Participar</h3>
            <p className="t-body mt-3 max-w-[44ch]"><Ph id="insc-categorias" /></p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="btn btn-ink cursor-default" aria-disabled="true">Inscrições em breve</span>
              <span className="t-small"><Ph id="insc-link" /></span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-5 md:col-start-8" data-reveal style={delay(1)}>
            <h3 className="t-sub">Apresentar trabalho</h3>
            <p className="t-body mt-3 max-w-[40ch]">Pesquisa ou experiência de campo, em um dos eixos temáticos.</p>
            <p className="t-body mt-3"><Ph id="sub-normas" /></p>
            <a href="#eixos" className="link mt-5 inline-flex items-center gap-2">Ver os eixos <Arrow className="h-4 w-4" /></a>
          </div>
        </div>

        <div className="mt-block">
          <h3 className="t-sub" data-reveal>Cronograma</h3>
          <ol className="relative mt-6 grid gap-6 md:grid-cols-4 md:gap-4">
            <span aria-hidden="true" className="absolute bottom-2 left-[6px] top-2 w-[3px] rounded-full bg-ink/25 md:bottom-auto md:left-0 md:right-0 md:top-[6px] md:h-[3px] md:w-auto" />
            {STEPS.map(([id, t], i) => (
              <li key={id} className="relative pl-9 md:pl-0 md:pt-9" data-reveal style={delay(i)}>
                <span aria-hidden="true" className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full bg-ink md:top-0" />
                <p className="t-item">{t}</p>
                <p className="t-small mt-1.5"><Ph id={id} label="Data a definir" /></p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
