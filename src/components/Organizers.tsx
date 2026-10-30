import { delay } from '../lib/hooks'
import { Ph } from './Ph'

const ORGS: [string, string][] = [
  ['UFMA', 'Departamento de Oceanografia e Limnologia, que organizou a primeira edição'],
  ['Fundação Sousândrade', 'apoio ao desenvolvimento da UFMA'],
  ['AOCEANO Norte', 'Associação Brasileira de Oceanografia, regional Norte'],
  ['Petrobras', 'projetos ambientais na Margem Equatorial'],
]

export function Organizers() {
  return (
    <section id="realizacao" data-chapter data-bg="#cdeef5" data-ink="#0b2440" className="bg-foam p-[10px] md:p-5" aria-labelledby="real-h">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <clipPath id="arch-clip" clipPathUnits="objectBoundingBox">
          <path d="M0,1 L0,0.36 C0,0.16 0.22,0 0.5,0 C0.78,0 1,0.16 1,0.36 L1,1 Z" />
        </clipPath>
      </svg>
      <div className="relative grid overflow-hidden rounded-[12px] bg-ink text-paper lg:min-h-[100svh] lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
        <div className="p-6 md:p-14 lg:col-span-7 lg:row-start-1">
          <h2 id="real-h" className="fs-head font-black leading-[0.95] tracking-[-0.03em]" data-reveal>Quem faz o congresso</h2>
          <p className="t-lead mt-5 max-w-[30ch] text-foam" data-reveal style={delay(1)}>A primeira edição foi realizada em São Luís pela Universidade Federal do Maranhão. A segunda acontece em Salinópolis.</p>
        </div>
        {/* a Igreja Matriz de Salinópolis, cortada pela borda do painel */}
        <figure className="order-last mx-6 mt-4 -mb-[18%] w-[min(78vw,36vw)] min-w-[240px] self-end md:mx-14 lg:order-none lg:col-span-7 lg:row-start-2 lg:mt-0" data-reveal style={delay(1)}>
          <img src={import.meta.env.BASE_URL + 'assets/igreja-matriz.webp'} width="1600" height="1200" alt="Igreja Matriz de Salinópolis, branca, diante de uma praça com piso de pedras portuguesas" loading="lazy" decoding="async" className="arch aspect-[4/5] w-full object-cover" />
        </figure>
        <div className="flex flex-col gap-14 px-6 pb-6 md:px-14 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:pb-14 lg:pt-14">
          <div data-reveal style={delay(1)}>
            <h3 className="fs-lead font-black tracking-tight">Quem realizou a primeira edição</h3>
            <ul className="mt-5 grid gap-4">
              {ORGS.map(([n, t]) => (
                <li key={n}>
                  <span className="block t-body font-medium">{n}</span>
                  <span className="t-body block text-sky">{t}</span>
                </li>
              ))}
            </ul>
            <p className="t-body mt-6"><Ph id="realizacao-2027" /></p>
          </div>
          <div data-reveal style={delay(2)}>
            <h3 className="fs-lead font-black tracking-tight">Sua empresa no congresso</h3>
            <p className="t-body mt-3 text-foam">
              Espaço para empresas que operam ou prestam serviços na Margem Equatorial.
            </p>
            <p className="t-body mt-4"><Ph id="patrocinio" /></p>
          </div>
        </div>
      </div>
    </section>
  )
}
