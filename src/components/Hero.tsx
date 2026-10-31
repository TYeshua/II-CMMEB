import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Arrow, LogoMark } from './Logo'
import { Ph } from './Ph'
import { useNow, useReducedMotion, useScrollProgress } from '../lib/hooks'
import { fmtM, slzClock, tideNow, TIDE_MEAN } from '../lib/tide'
import type { Label, World } from '../three/World'

const d = (n: number) => ({ '--d': n }) as CSSProperties
// profundidade ilustrativa mostrada junto à broca (mesmas constantes de three/drill.ts)
const SEABED = -300, BOTTOM = -350, WATER_M = 2900, ROCK_M = 1500
const fmtDepth = (tip: number) => {
  const n = (v: number) => Math.round(v).toLocaleString('pt-BR')
  if (tip > SEABED) return [n((-tip / -SEABED) * WATER_M) + ' m', 'de lâmina d’água']
  return [n(WATER_M + ((SEABED - tip) / (SEABED - BOTTOM)) * ROCK_M) + ' m', 'perfurando a rocha']
}

// o que orbita a indústria
const LABELS: Record<string, string> = {
  industria: 'Óleo e gás',
  mangue: 'Manguezais',
  guara: 'Fauna costeira',
  recife: 'Recifes amazônicos',
  pesca: 'Recursos pesqueiros',
  comunidade: 'Comunidades do mar',
}
// rótulos do mapa, durante a pausa sobre a margem (bacias na ordem oeste → leste, como em margin-regions.json)
// [prefixo que some em telas estreitas, nome]
const MAP_LABELS: Record<string, [string, string]> = {
  'bacia-0': ['Bacia da ', 'Foz do Amazonas'],
  'bacia-1': ['Bacia ', 'Pará-Maranhão'],
  'bacia-2': ['Bacia de ', 'Barreirinhas'],
  'bacia-3': ['Bacia do ', 'Ceará'],
  'bacia-4': ['Bacia ', 'Potiguar'],
  para: ['', 'Pará'],
  sede: ['', 'Salinópolis, sede'],
}
// legenda de cada trecho do voo
const STAGES: [number, string][] = [
  [0, 'Brasil'],
  [0.17, 'Margem Equatorial'],
  [0.28, 'O Pará e as bacias da margem'],
  [0.56, 'Bacia da Foz do Amazonas'],
  [0.7, 'Plataforma offshore'],
]
const DOTS = 48
// blocos que ficam do lado direito no desktop (a coluna de perfuração vai para a esquerda)
const RIGHT_CARDS = new Set(['margem', 'eixos', 'palestrantes', 'inscricoes', 'local'])

type Phase = 'loading' | 'flying' | 'done'

export function Hero() {
  const reduced = useReducedMotion()
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const world = useRef<World | null>(null)
  const labelEls = useRef<Record<string, HTMLSpanElement | null>>({})
  const [phase, setPhase] = useState<Phase>('loading')
  const [load, setLoad] = useState({ f: 0.04, label: 'Carregando as bibliotecas 3D' })
  const [stage, setStage] = useState(0)
  const p = useScrollProgress(section)
  const now = useNow(30_000)
  const tide = tideNow()

  // monta a cena com um carregamento de verdade e só então começa o voo
  useEffect(() => {
    let alive = true
    document.body.classList.add('intro-lock')
    const done = () => { setPhase('done'); document.body.classList.remove('intro-lock') }
    import('../three/World')
      .then(async ({ World }) => {
        if (!alive || !canvas.current) return
        const w = new World(canvas.current, reduced)
        let repeat = false
        try { repeat = sessionStorage.getItem('cmmeb-voo') === '1'; sessionStorage.setItem('cmmeb-voo', '1') } catch { /* sem storage */ }
        if (repeat) w.speed = 1.8
        w.onFinish = done
        w.onLabels = (ls: Label[]) => {
          const box = copy.current?.getBoundingClientRect()
          const top = 0
          ls.forEach(l => {
            const el = labelEls.current[l.id]
            if (!el) return
            // a sede fica abaixo do marcador; os demais rótulos, acima
            el.style.transform = `translate(${l.x}px, ${l.y}px) translate(-50%, ${l.id === 'sede' ? '12px' : '-100%'})`
            if (l.alpha !== undefined) { el.style.opacity = l.show ? String(l.alpha) : '0'; return }
            if (l.depth !== undefined) {
              const [v, t] = fmtDepth(l.depth)
              el.style.opacity = l.show ? '1' : '0'
              // com a broca à esquerda, o rótulo fica do lado de fora para não invadir os cards
              const left = l.x < innerWidth / 2
              el.style.transform = left ? `translate(${l.x - 192}px, ${l.y}px) translateX(-100%)` : `translate(${l.x}px, ${l.y}px)`
              el.style.textAlign = left ? 'right' : 'left'
              const [a, b] = el.children as unknown as HTMLElement[]
              if (a.textContent !== v) a.textContent = v
              if (b.textContent !== t) b.textContent = t
              return
            }
            // nenhum rótulo da órbita por cima do texto
            const hit = box && l.x + 90 > box.left - 12 && l.x - 90 < box.right + 12 && l.y + top > box.top - 12 && l.y - 28 + top < box.bottom + 12
            el.style.opacity = l.show && !hit ? '1' : '0'
          })
        }
        world.current = w
        await w.build((f, label) => alive && setLoad({ f, label }))
        if (!alive) { w.dispose(); return }
        setTimeout(() => {
          if (!alive) return
          setPhase('flying')
          w.play()
        }, 450)
      })
      .catch(() => { if (alive) done() })
    return () => { alive = false; world.current?.dispose(); world.current = null; document.body.classList.remove('intro-lock') }
  }, [reduced])

  // legendas do voo
  useEffect(() => {
    if (phase !== 'flying') return
    let raf = 0
    const tick = () => {
      const k = world.current?.progress ?? 0
      const i = STAGES.reduce((acc, s, j) => (k >= s[0] ? j : acc), 0)
      setStage(prev => (prev === i ? prev : i))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  // rolar, tocar ou usar o teclado durante o voo leva direto ao fim
  useEffect(() => {
    if (phase !== 'flying') return
    const skip = (e: Event) => {
      if (e instanceof KeyboardEvent && !['ArrowDown', 'PageDown', ' ', 'Enter', 'Escape', 'End'].includes(e.key)) return
      world.current?.skip()
    }
    addEventListener('wheel', skip, { passive: true })
    addEventListener('touchmove', skip, { passive: true })
    addEventListener('keydown', skip)
    return () => { removeEventListener('wheel', skip); removeEventListener('touchmove', skip); removeEventListener('keydown', skip) }
  }, [phase])

  useEffect(() => { if (world.current) world.current.tide = tide.h - TIDE_MEAN }, [tide.h, phase])
  useEffect(() => { if (world.current) world.current.dive = reduced ? 0 : p }, [p, reduced])
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const hero = section.current
      if (!hero || !world.current) return
      const start = hero.offsetHeight - innerHeight
      const end = document.documentElement.scrollHeight - innerHeight
      world.current.descent = reduced ? 0 : Math.min(1, Math.max(0, (scrollY - start) / Math.max(1, end - start)))
      // cards à direita empurram a coluna para a esquerda (ver index.css)
      const mid = innerHeight / 2
      for (const s of document.querySelectorAll<HTMLElement>('main > section:not(#inicio)')) {
        const r = s.getBoundingClientRect()
        if (r.top <= mid && r.bottom >= mid) { world.current.side = RIGHT_CARDS.has(s.id) ? -1 : 1; break }
      }
      if (scrollY + innerHeight >= end + innerHeight - 4) world.current.side = 1
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [reduced, phase])

  const copyFade = Math.max(0, 1 - p * 3.2)
  const lit = Math.round(load.f * DOTS)

  return (
    <section
      id="inicio"
      ref={section}
      data-chapter
      data-bg="transparent"
      data-ink="#f2f9fb"
      className={`relative bg-abyss text-paper ${phase === 'done' ? '' : 'paused'}`}
      style={{ height: reduced ? '100svh' : '150svh' }}
    >
      {/* a cena fica fixa atrás da página inteira: a coluna de perfuração desce com a rolagem */}
      <div className="deep-layer fixed inset-0" aria-hidden="true">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute left-0 top-0 hidden md:block" ref={el => { labelEls.current.broca = el as HTMLSpanElement | null }} style={{ opacity: 0, textShadow: "0 1px 10px rgba(6,20,42,0.95), 0 0 2px rgba(6,20,42,0.9)" }}>
          <span className="block translate-x-24 -translate-y-1/2 tnum fs-lead font-black leading-none text-paper" />
          <span className="block translate-x-24 -translate-y-1/2 pt-1 t-small text-sky" />
        </div>
      </div>
      <div className="hero-stage sticky top-0 h-[100svh] overflow-hidden">

        {/* rótulos da órbita, posicionados pela cena */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden="true" style={{ opacity: copyFade }}>
          {Object.entries(LABELS).map(([id, t]) => (
            <span
              key={id}
              ref={el => { labelEls.current[id] = el }}
              className={`hero-label absolute left-0 top-0 whitespace-nowrap px-2 py-0.5 t-small font-medium ${id === 'industria' ? 'bg-sun text-ink' : 'text-foam'}`}
              style={{ opacity: 0 }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* rótulos do mapa da margem */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {Object.entries(MAP_LABELS).map(([id, [pre, t]]) => (
            <span
              key={id}
              ref={el => { labelEls.current[id] = el }}
              className={`absolute left-0 top-0 whitespace-nowrap ${id === 'para' ? 'fs-lead font-black tracking-tight text-paper' : id === 'sede' ? 'bg-guara-field px-2 py-0.5 t-small font-medium text-paper' : 't-small font-medium text-sun sm:text-[length:var(--step-body)]'}`}
              style={{ opacity: 0 }}
            >
              {pre && <span className="hidden sm:inline">{pre}</span>}{t}
            </span>
          ))}
        </div>

        {/* legendas e atalho durante o voo */}
        {phase === 'flying' && (
          <div className="wrap absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 pb-8">
            <p key={stage} className="fs-sub stage-in font-black leading-none tracking-[-0.03em]" style={{ animationDelay: stage === 0 ? "700ms" : undefined }} aria-live="polite">{STAGES[stage][1]}</p>
            <button type="button" onClick={() => world.current?.skip()} className="btn btn-paper shrink-0">Pular animação</button>
          </div>
        )}

        <div
          className="hero-copy wrap relative flex h-full flex-col pt-[calc(var(--hdr)+3svh)] pb-8"
          style={{ opacity: copyFade, transform: `translateY(${-p * 120}px)`, visibility: copyFade <= 0 || phase !== 'done' ? 'hidden' : undefined }}
          aria-hidden={phase !== 'done' ? true : undefined}
        >
          <div ref={copy} className="self-start">
            <h1 className="font-black">
              <span className="hero-name block h-in" style={d(0)}>II CMMEB</span>
              <span className="hero-theme hero-l2 block h-in" style={d(1)}>Integração Indústria e Meio Ambiente</span>
            </h1>
            <p className="t-lead mt-6 max-w-[38ch] font-medium h-in" style={d(2)}>
              II Congresso de Ciências do Mar na Margem Equatorial Brasileira.
            </p>
            <p className="t-body mt-4 h-in" style={d(3)}><Ph id="datas" /> · Salinópolis, PA</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4 h-in" style={d(4)}>
              <a href="#inscricoes" className="btn btn-sun">Quero me inscrever <Arrow /></a>
              <a href="#industria" className="link">Começar pela indústria</a>
            </div>
          </div>
          <p className="t-small mt-auto flex max-w-[64ch] items-center gap-2 text-foam tnum h-in" style={d(5)}>
            <span className="pulse-dot inline-block h-2 w-2 shrink-0 rounded-full bg-sun" aria-hidden="true" />
            <span>Simulação de maré em Salinópolis às {slzClock(now)}: <b className="font-medium text-paper">{fmtM(tide.h)}</b>, {tide.rising ? 'enchendo' : 'vazando'}. O nível do mar na cena acompanha.</span>
          </p>
        </div>

      </div>

      {/* carregamento de verdade: dá tempo de a cena inteira ficar pronta antes do voo */}
      <div className="boot" data-out={phase !== 'loading'} role="progressbar" aria-label="Preparando o site" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(load.f * 100)}>
        <div className="wrap flex h-full flex-col justify-between pb-8 pt-6">
          <div className="flex items-center gap-3">
            <LogoMark className="h-10 w-10 text-paper" />
            <span className="text-lg font-black tracking-tight">II CMMEB · 2027</span>
          </div>
          <div className="max-w-[640px]">
            <p className="fs-sub font-black leading-none tracking-[-0.03em]">Preparando a margem</p>
            <p className="t-body mt-3 text-sky">{load.label}</p>
            <div className="mt-6 flex flex-wrap gap-[6px]" aria-hidden="true">
              {Array.from({ length: DOTS }, (_, i) => (
                <i key={i} className={`boot-dot ${i < lit ? 'is-on' : ''}`} style={{ transitionDelay: `${(i % 6) * 20}ms` }} />
              ))}
            </div>
            <p className="t-small mt-3 tnum text-sky"><span className="font-medium text-sun">{Math.round(load.f * 100)}%</span> · II Congresso de Ciências do Mar na Margem Equatorial Brasileira</p>
          </div>
        </div>
      </div>
    </section>
  )
}
