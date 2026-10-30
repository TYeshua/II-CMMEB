import { delay } from '../lib/hooks'
import { Ph } from './Ph'

const ITEMS = ['prog-abertura', 'prog-sessoes', 'prog-mesas', 'prog-posteres', 'prog-encerramento', 'prog-grade']

/** A grade de 2027 ainda não existe: o formato de 2024 serve de guia e cada bloco tem seu espaço numerado. */
export function Program() {
  return (
    <section id="programacao" data-chapter data-bg="#f2f9fb" data-ink="#0b2440" className="bg-paper text-ink" aria-labelledby="prog-h">
      <div className="wrap grid12 gap-y-10 py-[clamp(48px,8vw,140px)]">
        <div className="col-span-12 lg:col-span-5">
          <h2 id="prog-h" className="t-head" data-reveal>Programação</h2>
          <p className="t-body mt-5 max-w-[46ch]" data-reveal style={delay(1)}>
            A grade sai com a confirmação das datas. O formato segue a primeira edição: palestras, mesas-redondas e sessões de pôsteres.
          </p>
          <p className="fs-lead mt-6 font-medium" data-reveal style={delay(2)}><Ph id="datas" /></p>
          <figure className="mt-10" data-reveal="clip" style={delay(2)}>
            <div className="overflow-hidden">
              <img src={import.meta.env.BASE_URL + 'assets/atalaia-mare.webp'} width="1600" height="1064" alt="Praia do Atalaia na maré baixa, com a areia molhada até o horizonte sob céu nublado" loading="lazy" decoding="async" className="breathe aspect-[4/3] w-full object-cover" />
            </div>
            <figcaption className="t-small mt-2">Praia do Atalaia na maré baixa, Salinópolis</figcaption>
          </figure>
        </div>
        <ol className="col-span-12 grid content-start gap-2 lg:col-span-6 lg:col-start-7">
          {ITEMS.map((id, i) => (
            <li key={id} className={`p-6 md:p-8 ${i % 2 ? 'bg-foam' : 'bg-sky'}`} data-reveal style={delay(i * 0.6)}>
              <span className="fs-lead block font-medium leading-snug"><Ph id={id} /></span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
