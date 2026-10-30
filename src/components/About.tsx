import { delay } from '../lib/hooks'
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
    <section id="sobre" data-chapter data-bg="#cdeef5" data-ink="#0b2440" className="relative bg-foam text-ink">
      <div className="wrap pt-[clamp(48px,8vw,140px)] pb-[clamp(48px,8vw,140px)]">
        <h2 className="t-head" data-reveal>A nova fronteira do Atlântico</h2>

        <div className="grid12 mt-[clamp(40px,6vh,80px)] items-start gap-y-10">
          <p className="col-span-12 font-black fs-lead leading-[1.12] tracking-[-0.02em] text-pretty md:col-span-6" data-reveal style={delay(1)}>
            A indústria de óleo e gás no centro; a margem e o ambiente ao redor. Quem opera, quem estuda e quem vive desse mar.
          </p>
          <ol className="col-span-12 grid gap-2 md:col-span-6 md:col-start-7">
            {PARTS.map(([ring, href, title, text], i) => (
              <li key={ring} data-reveal style={delay(i + 1)}>
                <a href={href} className="group flex items-center gap-5 bg-paper p-5 no-underline transition-colors duration-200 hover:bg-sky">
                  <OrbitMark active={ring} className="w-14 text-sea" />
                  <span>
                    <span className="fs-lead block font-black leading-tight">{title}</span>
                    <span className="t-body block">{text}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        <p className="t-body mt-[clamp(40px,6vh,72px)] max-w-[62ch]" data-reveal>
          Recifes sob a pluma do Amazonas, a maior faixa contínua de manguezais do mundo, cinco bacias sedimentares e comunidades que vivem do mar. O tema Integração Indústria e Meio Ambiente organiza o encontro para que o dado ambiental e a decisão industrial falem a mesma língua.
        </p>

        <ol className="mt-[clamp(72px,11vh,140px)] grid gap-10 md:gap-6">
          {YEARS.map((y, i) => (
            <li key={y.y} className="grid12 items-baseline gap-y-2" data-reveal style={delay(i)}>
              <span className={`tnum col-span-12 font-black fs-display leading-[0.85] tracking-[-0.045em] md:col-span-5 ${i === 2 ? 'text-sea' : ''}`}>{y.y}</span>
              <div className="col-span-12 md:col-span-6 md:col-start-7">
                <h3 className="fs-lead font-black tracking-tight">{y.h}</h3>
                <p className="t-body mt-1 max-w-[52ch]">{y.t}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
