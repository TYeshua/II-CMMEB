import { faq } from '../data/content'
import { SectionHead } from './Head'
import { Ph } from './Ph'

export function Faq() {
  return (
    <section id="duvidas" data-chapter data-bg="#f2f9fb" data-ink="#0b2440" className="bg-paper text-ink" aria-labelledby="faq-h">
      <div className="wrap sec-pad">
        <SectionHead id="faq-h" title="Antes de embarcar" lead="Perguntas frequentes sobre participação, trabalhos e apoio." />
        <dl className="mt-block grid gap-y-7">
          {faq.map(([q, a]) => (
            <div key={q} className="grid12 gap-y-1.5" data-reveal>
              <dt className="t-item col-span-12 md:col-span-5">{q}</dt>
              <dd className="t-body col-span-12 m-0 md:col-span-7"><Ph id={a} /></dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
