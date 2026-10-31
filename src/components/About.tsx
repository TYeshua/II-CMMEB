import { delay } from '../lib/hooks'
import { SectionHead } from './Head'
import { Arrow } from './Logo'
import { OrbitMark, type Ring } from './OrbitMark'

// a estrutura do site, do centro para fora
const PARTS: [Ring, string, string, string][] = [
  ['centro', '#industria', 'No centro, a indústria', 'As cinco bacias sedimentares e os blocos de óleo e gás.'],
  ['margem', '#margem', 'Ao redor, a margem', 'O território da costa à bacia oceânica.'],
  ['ambiente', '#ambiente', 'Em órbita, o ambiente', 'Manguezais, recifes, fauna e quem vive do mar.'],
]

const YEARS = [
  { y: '2023', h: 'Oficinas de trabalho', t: 'Em São Luís, 71 pesquisadores e 10 representantes da Petrobras mapearam as lacunas de conhecimento oceanográfico da região.' },
  { y: '2024', h: 'I Congresso', t: '31 palestras, 3 mesas-redondas e 3 sessões de pôsteres, com 22 instituições na programação, em três dias de outubro.' },
  { y: '2027', h: 'II Congresso', t: 'Segunda edição, com o tema Integração Indústria e Meio Ambiente, em Salinópolis, no Pará.' },
]

export function About() {
  return (
    <section id="sobre" data-chapter data-bg="#cdeef5" data-ink="#0b2440" className="relative bg-foam text-ink" aria-labelledby="sobre-h">
      <div className="wrap sec-pad">
        <SectionHead
          id="sobre-h"
          title="A nova fronteira do Atlântico"
          lead="A indústria de óleo e gás no centro; a margem e o ambiente ao redor. Quem opera, quem estuda e quem vive desse mar."
        />

        <div className="grid12 mt-block items-start gap-y-8">
          <p className="t-body col-span-12 max-w-[52ch] md:col-span-5" data-reveal>
            Recifes sob a pluma do Amazonas, a maior faixa contínua de manguezais do mundo, cinco bacias sedimentares e comunidades que vivem do mar. O tema Integração Indústria e Meio Ambiente organiza o encontro para que o dado ambiental e a decisão industrial falem a mesma língua.
          </p>
          {/* índice do site: do centro para fora */}
          <ol className="col-span-12 grid gap-1 md:col-span-7">
            {PARTS.map(([ring, href, title, text], i) => (
              <li key={ring} data-reveal style={delay(i + 1)}>
                <a href={href} className="index-row group">
                  <OrbitMark active={ring} className="w-11 text-sea" />
                  <span className="min-w-0 flex-1">
                    <span className="t-item block">{title}</span>
                    <span className="t-small mt-0.5 block">{text}</span>
                  </span>
                  <Arrow className="index-arrow h-5 w-5 shrink-0" />
                </a>
              </li>
            ))}
          </ol>
        </div>

        <ol className="mt-block grid gap-8 md:gap-5">
          {YEARS.map((y, i) => (
            <li key={y.y} className="grid12 items-baseline gap-y-1" data-reveal style={delay(i)}>
              <span className={`tnum col-span-12 font-black fs-head leading-none tracking-[-0.04em] md:col-span-5 ${i === 2 ? 'text-sea' : ''}`}>{y.y}</span>
              <div className="col-span-12 md:col-span-7">
                <h3 className="t-item">{y.h}</h3>
                <p className="t-body mt-1 max-w-[52ch]">{y.t}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
