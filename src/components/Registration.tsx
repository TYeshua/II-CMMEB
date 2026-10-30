import { delay } from '../lib/hooks'
import { Arrow } from './Logo'
import { Ph, PhNum } from './Ph'

const STEPS: [string, string][] = [
  ['insc-abertura', 'Abertura das inscrições'],
  ['sub-prazo', 'Prazo de submissão'],
  ['resultado', 'Resultado da avaliação'],
  ['datas', 'Congresso em Salinópolis'],
]

export function Registration() {
  return (
    <section id="inscricoes" aria-label="Inscrições e submissões">
      <div className="grid lg:grid-cols-12">
        <div data-chapter data-bg="#1b6ba3" data-ink="#f2f9fb" className="flex min-h-[64svh] flex-col bg-sea p-[var(--m)] pt-[clamp(48px,8vw,140px)] text-paper lg:col-span-5 lg:min-h-[86svh] lg:p-10 lg:pt-[clamp(48px,8vw,140px)]">
          <h2 className="fs-head font-black leading-[0.92] tracking-[-0.03em]" data-reveal>Submissões</h2>
          <p className="fs-lead mt-5 max-w-[26ch] leading-snug" data-reveal style={delay(1)}>Para quem vai apresentar trabalho: pesquisa ou experiência de campo.</p>
          <p className="t-body mt-6 max-w-[44ch]" data-reveal style={delay(2)}><Ph id="sub-normas" /></p>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-12">
            <p className="font-black leading-[0.85] tracking-[-0.04em]">
              <PhNum id="sub-prazo" className="fs-display" />
              <span className="t-body mt-2 block font-medium tracking-normal">prazo de submissão</span>
            </p>
            <a href="#eixos" className="btn btn-paper">Ver os eixos <Arrow /></a>
          </div>
        </div>

        <div data-chapter data-bg="#f5a524" data-ink="#0b2440" className="flex min-h-[70svh] flex-col bg-sun p-[var(--m)] pt-[clamp(48px,8vw,140px)] text-ink lg:col-span-7 lg:min-h-[86svh] lg:p-10 lg:pt-[clamp(48px,8vw,140px)]">
          <h2 className="fs-head font-black leading-[0.92] tracking-[-0.03em]" data-reveal>Inscrição</h2>
          <p className="fs-lead mt-5 max-w-[26ch] leading-snug" data-reveal style={delay(1)}>Para participar do congresso, com ou sem trabalho.</p>
          <p className="t-body mt-6 max-w-[56ch]" data-reveal style={delay(2)}><Ph id="insc-categorias" /></p>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-12">
            <p className="font-black leading-[0.85] tracking-[-0.04em]">
              <PhNum id="insc-abertura" className="fs-display" />
              <span className="t-body mt-2 block font-medium tracking-normal">abertura das inscrições</span>
            </p>
            <div className="flex flex-col items-start gap-3">
              <span className="btn btn-ink cursor-default" aria-disabled="true">Inscrições em breve</span>
              <span className="t-small"><Ph id="insc-link" /></span>
            </div>
          </div>
        </div>
      </div>

      <div data-chapter data-bg="#8fd3e8" data-ink="#0b2440" className="bg-sky text-ink">
        <div className="wrap py-[clamp(48px,7vw,120px)]">
          <h3 className="fs-sub font-black leading-none tracking-[-0.03em]" data-reveal>Cronograma</h3>
          <ol className="relative mt-12 grid gap-8 md:grid-cols-4 md:gap-4">
            <span aria-hidden="true" className="absolute bottom-0 left-[7px] top-0 w-1 bg-surf md:bottom-auto md:left-0 md:right-0 md:top-[7px] md:h-1 md:w-auto" />
            {STEPS.map(([id, t], i) => (
              <li key={id} className="relative pl-10 md:pl-0 md:pt-10" data-reveal style={delay(i)}>
                <span aria-hidden="true" className="absolute left-0 top-1 h-[18px] w-[18px] rounded-full bg-paper md:top-0" />
                <p className="fs-lead font-black tracking-tight">{t}</p>
                <p className="t-body mt-2"><Ph id={id} label="Data a definir" /></p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
