import { delay } from '../lib/hooks'
import { SectionHead } from './Head'
import { Ph } from './Ph'

const ORGS: [string, string][] = [
  ['UFMA', 'Departamento de Oceanografia e Limnologia, que organizou a primeira edição'],
  ['Fundação Sousândrade', 'apoio ao desenvolvimento da UFMA'],
  ['AOCEANO Norte', 'Associação Brasileira de Oceanografia, regional Norte'],
  ['Petrobras', 'projetos ambientais na Margem Equatorial'],
]

export function Organizers() {
  return (
    <section id="realizacao" data-chapter data-bg="#0b2440" data-ink="#f2f9fb" className="bg-ink text-paper" aria-labelledby="real-h">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <clipPath id="arch-clip" clipPathUnits="objectBoundingBox">
          <path d="M0,1 L0,0.36 C0,0.16 0.22,0 0.5,0 C0.78,0 1,0.16 1,0.36 L1,1 Z" />
        </clipPath>
      </svg>
      <div className="wrap sec-pad">
        <SectionHead
          id="real-h"
          title="Quem faz o congresso"
          lead="A primeira edição foi realizada em São Luís pela Universidade Federal do Maranhão. A segunda acontece em Salinópolis."
        />
        <div className="grid12 mt-block items-end gap-y-10">
          {/* a Igreja Matriz de Salinópolis, no arco das portas do centro histórico */}
          <figure className="col-span-12 m-0 max-w-[340px] sm:col-span-5 md:col-span-4" data-reveal>
            <img src={import.meta.env.BASE_URL + 'assets/igreja-matriz.webp'} width="1600" height="1200" alt="Igreja Matriz de Salinópolis, branca, diante de uma praça com piso de pedras portuguesas" loading="lazy" decoding="async" className="arch aspect-[4/5] w-full object-cover" />
            <figcaption className="t-small mt-2 text-sky">Igreja Matriz, Salinópolis</figcaption>
          </figure>
          <div className="col-span-12 grid gap-10 sm:col-span-7 md:col-span-7 md:col-start-6">
            <div data-reveal style={delay(1)}>
              <h3 className="t-item">Quem realizou a primeira edição</h3>
              <ul className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-2">
                {ORGS.map(([n, t]) => (
                  <li key={n} className="t-small">
                    <span className="t-body block font-medium">{n}</span>
                    <span className="block text-sky">{t}</span>
                  </li>
                ))}
              </ul>
              <p className="t-body mt-5"><Ph id="realizacao-2027" /></p>
            </div>
            <div data-reveal style={delay(2)}>
              <h3 className="t-item">Sua empresa no congresso</h3>
              <p className="t-body mt-2 max-w-[48ch] text-foam">Espaço para empresas que operam ou prestam serviços na Margem Equatorial.</p>
              <p className="t-body mt-3"><Ph id="patrocinio" /></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
