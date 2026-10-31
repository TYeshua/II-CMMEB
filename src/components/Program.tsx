import { delay } from '../lib/hooks'
import { SectionHead } from './Head'
import { Ph } from './Ph'

const ITEMS = ['prog-abertura', 'prog-sessoes', 'prog-mesas', 'prog-posteres', 'prog-encerramento', 'prog-grade']

/** A grade de 2027 ainda não existe: o formato de 2024 serve de guia e cada bloco tem seu espaço numerado. */
export function Program() {
  return (
    <section id="programacao" data-chapter data-bg="#f2f9fb" data-ink="#0b2440" className="bg-paper text-ink" aria-labelledby="prog-h">
      <div className="wrap sec-pad">
        <SectionHead
          id="prog-h"
          title="Programação"
          lead="A grade sai com a confirmação das datas. O formato segue a primeira edição: palestras, mesas-redondas e sessões de pôsteres."
        />
        <div className="grid12 mt-block items-start gap-y-8">
          <figure className="col-span-12 md:col-span-5" data-reveal="clip">
            <div className="overflow-hidden rounded-[10px]">
              <img src={import.meta.env.BASE_URL + 'assets/atalaia-mare.webp'} width="1600" height="1064" alt="Praia do Atalaia na maré baixa, com a areia molhada até o horizonte sob céu nublado" loading="lazy" decoding="async" className="breathe aspect-[4/3] w-full object-cover" />
            </div>
            <figcaption className="t-small mt-2 text-deep">Praia do Atalaia na maré baixa, Salinópolis</figcaption>
          </figure>
          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <p className="t-item" data-reveal><Ph id="datas" /></p>
            {/* a ordem dos blocos segue os dias do congresso */}
            <ol className="steps mt-6">
              {ITEMS.map((id, i) => (
                <li key={id} className="t-intro" data-reveal style={delay(i * 0.5)}><Ph id={id} /></li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
