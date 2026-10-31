import { useEffect, useRef, useState } from 'react'
import { basins, LENS } from '../data/content'
import { useReducedMotion } from '../lib/hooks'
import type { BasinMap } from '../three/BasinMap'
import { SectionHead } from './Head'

/** As cinco bacias num relevo 3D de pontos. Escolher uma bacia leva a câmera até ela. */
export function Basins() {
  const reduced = useReducedMotion()
  const canvas = useRef<HTMLCanvasElement>(null)
  const map = useRef<BasinMap | null>(null)
  const label = useRef<HTMLDivElement>(null)
  const slz = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const selRef = useRef(1)
  const [sel, setSel] = useState(1)
  const [gl, setGl] = useState(true)

  useEffect(() => {
    let alive = true
    let io: IntersectionObserver | undefined
    const start = () => import('../three/BasinMap').then(({ BasinMap }) => {
      if (!alive || !canvas.current) return
      try {
        const m = new BasinMap(canvas.current, reduced)
        m.onProject = (x, y, sx, sy) => {
          if (label.current) label.current.style.transform = `translate(${x}px, ${y}px)`
          if (slz.current) slz.current.style.transform = `translate(${sx}px, ${sy}px)`
        }
        m.select(selRef.current, true)
        map.current = m
        io = new IntersectionObserver(([e]) => m.setVisible(e.isIntersecting), { rootMargin: '100px' })
        io.observe(box.current!)
      } catch { setGl(false) }
    })
    // só carrega quando a seção se aproxima
    const pre = new IntersectionObserver(([e]) => { if (e.isIntersecting) { pre.disconnect(); start() } }, { rootMargin: '600px' })
    if (box.current) pre.observe(box.current)
    return () => { alive = false; pre.disconnect(); io?.disconnect(); map.current?.dispose(); map.current = null }
  }, [reduced])

  const pick = (i: number) => { selRef.current = i; setSel(i); map.current?.select(i) }
  const b = basins[sel]

  return (
    <section id="industria" data-chapter data-bg="#06142a" data-ink="#f2f9fb" className="relative bg-abyss text-paper" aria-labelledby="industria-h">
      <div className="wrap sec-pad">
        <SectionHead
          id="industria-h"
          mark="centro"
          markClass="text-sky"
          title="No centro, a indústria"
          lead="A nova fronteira de óleo e gás do país: cinco bacias sedimentares, da Foz do Amazonas à Potiguar, com blocos exploratórios em águas profundas."
        />
      <div className="grid12 mt-block gap-y-8">
        <div className="col-span-12 flex flex-col lg:col-span-4">
          <div role="tablist" aria-label="Bacias sedimentares" aria-orientation="vertical" className="flex flex-col">
            {basins.map((x, i) => (
              <button
                key={x.name}
                role="tab"
                type="button"
                aria-selected={sel === i}
                aria-controls="bacia-painel"
                onClick={() => pick(i)}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    const n = (i + (e.key === 'ArrowDown' ? 1 : basins.length - 1)) % basins.length
                    pick(n)
                    ;(e.currentTarget.parentElement!.children[n] as HTMLElement).focus()
                  }
                }}
                tabIndex={sel === i ? 0 : -1}
                className={`basin-tab ${sel === i ? 'is-on' : ''}`}
              >
                <span className="t-item">{x.name}</span>
                <span className="t-small tnum">{x.states}</span>
              </button>
            ))}
          </div>
          <div id="bacia-painel" role="tabpanel" aria-live="polite" className="mt-6">
            <p className="t-body text-foam">{b.text}</p>
            <p className="t-small mt-3 text-sky">{b.lens.map(l => LENS[l]).join(' e ')}</p>
          </div>
        </div>

        <div ref={box} className="relative col-span-12 min-h-[420px] lg:col-span-8 lg:min-h-[640px]">
          {gl ? (
            <>
              <canvas
                ref={canvas}
                className="absolute inset-0 h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
                role="img"
                aria-label={`Relevo esquemático da Margem Equatorial com a bacia ${b.name} em destaque`}
              />
              <div ref={label} className="pointer-events-none absolute left-0 top-0" aria-hidden="true">
                <span className="block -translate-x-1/2 -translate-y-full whitespace-nowrap bg-sun px-3 py-1 t-small font-medium text-ink">{b.name}</span>
              </div>
              <div ref={slz} className="pointer-events-none absolute left-0 top-0" aria-hidden="true">
                <span className="block translate-x-3 translate-y-2 whitespace-nowrap t-small font-medium text-paper">Salinópolis, sede</span>
              </div>
            </>
          ) : (
            <div className="t-body grid h-full place-items-center bg-navy p-8 text-center">O mapa 3D precisa de WebGL. As cinco bacias estão descritas na lista ao lado.</div>
          )}
          <p className="t-small absolute bottom-0 right-0 text-sky">Relevo esquemático, fora de escala</p>
        </div>
      </div>
      </div>
    </section>
  )
}
