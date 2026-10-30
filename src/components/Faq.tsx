import { faq } from '../data/content'
import { delay } from '../lib/hooks'
import { Ph } from './Ph'

export function Faq() {
  return (
    <section id="duvidas" aria-labelledby="faq-h">
      <div data-chapter data-bg="#f5a524" data-ink="#0b2440" className="flex min-h-[30svh] items-end bg-sun text-ink md:min-h-[40svh]">
        <h2 id="faq-h" className="wrap pb-8 fs-display font-black leading-[0.9] tracking-[-0.04em]" data-reveal>Antes de embarcar</h2>
      </div>
      {faq.map(([q, a], i) => (
        <div key={q} data-chapter data-bg={i % 2 ? '#cdeef5' : '#f2f9fb'} data-ink="#0b2440" className={`${i % 2 ? 'bg-foam' : 'bg-paper'} text-ink`}>
          <div className="wrap grid12 gap-y-3 py-8 md:py-14">
            <h3 className="col-span-12 fs-lead font-black leading-[1.1] tracking-[-0.02em] md:col-span-5" data-reveal>{q}</h3>
            <p className="t-body col-span-12 md:col-span-6 md:col-start-7" data-reveal style={delay(1)}><Ph id={a} /></p>
          </div>
        </div>
      ))}
    </section>
  )
}
