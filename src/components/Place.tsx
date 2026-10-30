import { useMemo } from 'react'
import { delay, useNow } from '../lib/hooks'
import { fmtM, slzClock, tideAt } from '../lib/tide'
import type { ReactNode } from 'react'
import { Ph } from './Ph'

const W = 640, H = 220, PAD = 28, MAX = 7.2

/** Simulação da maré nas próximas 24 h na costa de Salinópolis, com o momento atual marcado. */
function TideChart() {
  const now = useNow(60_000)
  const { d, area, pts, cur } = useMemo(() => {
    const start = now - 3 * 3600e3
    const pts: [number, number, number][] = []
    for (let i = 0; i <= 96; i++) {
      const t = start + (i / 96) * 24 * 3600e3
      const h = tideAt(t)
      pts.push([PAD + (i / 96) * (W - 2 * PAD), H - PAD - (h / MAX) * (H - 2 * PAD), t])
    }
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
    const area = `${d} L${W - PAD},${H - PAD} L${PAD},${H - PAD} Z`
    const cur = pts[12]
    return { d, area, pts, cur }
  }, [now])
  const hNow = tideAt(now)
  const peaks = pts.filter((p, i) => i > 0 && i < pts.length - 1 && ((p[1] < pts[i - 1][1] && p[1] <= pts[i + 1][1]) || (p[1] > pts[i - 1][1] && p[1] >= pts[i + 1][1])))

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Simulação da maré nas próximas 24 horas em Salinópolis. Agora: ${fmtM(hNow)}.`}>
        <path d={area} fill="#1b6ba3" />
        <path d={d} fill="none" stroke="#8fd3e8" strokeWidth="3" />
        {peaks.map(p => (
          <g key={p[2]}>
            <text x={p[0]} y={p[1] < H / 2 ? p[1] - 10 : p[1] + 22} textAnchor="middle" fontSize="15" fill="#cdeef5" className="tnum">{slzClock(p[2])}</text>
          </g>
        ))}
        <rect x={cur[0] - 1.5} y={PAD - 6} width="3" height={H - 2 * PAD + 6} fill="#f5a524" />
        <circle cx={cur[0]} cy={cur[1]} r="7" fill="#f5a524" />
      </svg>
      <figcaption className="t-small mt-3 text-foam tnum">
        Agora, {slzClock(now)}: <b className="font-medium text-paper">{fmtM(hNow)}</b>. Curva simulada por um modelo harmônico simplificado, sem calibração com a tábua de marés: não use para navegação.
      </figcaption>
    </figure>
  )
}

const ROWS: { t: ReactNode; key: string; href?: string; label?: string }[] = [
  { key: 'regiao', t: 'Litoral nordeste do Pará' },
  { key: 'datas', t: <Ph id="datas" /> },
  { key: 'local', t: <Ph id="local" label="Espaço do evento" /> },
  { key: 'coord', t: '00°37′S 47°21′W', href: 'https://www.openstreetmap.org/?mlat=-0.614&mlon=-47.356#map=12/-0.614/-47.356', label: 'Abrir 00°37′S 47°21′W no mapa' },
]

export function Place() {
  return (
    <section id="local" className="bg-navy text-paper" aria-labelledby="local-h">
      <div data-chapter data-bg="#0c4d79" data-ink="#f2f9fb" className="bg-deep">
        <div className="wrap flex min-h-[150px] items-end justify-between gap-6 pb-6 pt-[clamp(48px,8vw,140px)]">
          <h2 id="local-h" className="fs-head font-black leading-[0.95] tracking-[-0.035em]" data-reveal>Salinópolis, Pará</h2>
          <img src={import.meta.env.BASE_URL + 'assets/atalaia.webp'} width="1600" height="1067" alt="Faixa larga de areia da Praia do Atalaia, em Salinópolis, com barracas coloridas ao fundo" loading="lazy" decoding="async" className="hidden aspect-square w-[clamp(96px,10vw,150px)] shrink-0 rounded-full object-cover object-[30%_75%] sm:block" data-reveal style={delay(1)} />
        </div>
      </div>
      <div data-chapter data-bg="#0a3253" data-ink="#f2f9fb">
        {ROWS.map((r, i) => {
          const inner = (
            <>
              <span className="fs-head font-normal leading-none tracking-[-0.03em]">
                {r.t}
              </span>
            </>
          )
          return (
            <div key={r.key} className={i % 2 ? 'bg-deep' : 'bg-navy'}>
              {r.href ? (
                <a href={r.href} aria-label={r.label} target="_blank" rel="noreferrer" className="wrap group flex min-h-[clamp(84px,13vh,150px)] items-end justify-between gap-6 pb-5 no-underline transition-colors duration-200 hover:text-sun">{inner}</a>
              ) : (
                <p className="wrap flex min-h-[clamp(84px,13vh,150px)] items-end justify-between gap-6 pb-5" data-reveal>{inner}</p>
              )}
            </div>
          )
        })}
        <div className="wrap grid12 gap-y-10 py-[clamp(48px,7vw,120px)]">
          <div className="col-span-12 lg:col-span-5">
            <h3 className="fs-sub font-black leading-[1.05] tracking-[-0.025em]" data-reveal>Uma costa de macromarés</h3>
            <p className="t-body mt-4 max-w-[46ch]" data-reveal style={delay(1)}>
              Salinópolis fica de frente para a bacia Pará-Maranhão, entre manguezais contínuos e praias largas que a maré cobre e descobre duas vezes por dia. É a costa da Margem Equatorial que o congresso discute.
            </p>
            <p className="t-body mt-8"><Ph id="contato" /></p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7" data-reveal style={delay(2)}>
            <TideChart />
          </div>
        </div>
      </div>
    </section>
  )
}
