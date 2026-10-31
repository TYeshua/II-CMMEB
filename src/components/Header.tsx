import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Arrow, LogoMark } from './Logo'

// a navegação segue a estrutura do site: o centro, as duas órbitas e depois o evento
const LINKS: [string, string][] = [
  ['#industria', 'Indústria'],
  ['#margem', 'Margem'],
  ['#ambiente', 'Ambiente'],
  ['#programacao', 'Programação'],
  ['#local', 'Local'],
]
// menu lateral: o tema (o centro e as órbitas) primeiro, depois o evento
const DRAWER: { title: string; links: [string, string, string][] }[] = [
  { title: 'O tema', links: [['#industria', 'Indústria', '#f5a524'], ['#margem', 'Margem', '#2a9fbd'], ['#ambiente', 'Ambiente', '#8fd3e8']] },
  { title: 'O congresso', links: [['#sobre', 'Sobre', '#cdeef5'], ['#eixos', 'Eixos temáticos', '#d33a2c'], ['#palestrantes', 'Palestrantes', '#cdeef5'], ['#programacao', 'Programação', '#cdeef5'], ['#local', 'Local', '#e0622a'], ['#duvidas', 'Dúvidas', '#cdeef5']] },
]

/** Barra fixa de vidro escuro; marca a seção que está passando por baixo dela. */
export function Header() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const panel = useRef<HTMLElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const drag = useRef<{ x: number; y: number; dx: number; on: boolean } | null>(null)

  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const probe = innerHeight * 0.3
      let hit: HTMLElement | null = null
      document.querySelectorAll<HTMLElement>('[data-chapter]').forEach(el => {
        const r = el.getBoundingClientRect()
        if (r.top <= probe && r.bottom > probe) hit = el
      })
      if (!hit) return
      const el = hit as HTMLElement
      const sec = el.closest('section[id]')?.id || el.id
      setCurrent('#' + sec)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on) }
  }, [])

  // menu aberto: trava a rolagem, Esc fecha, o Tab fica preso no painel e o foco volta ao botão ao fechar
  useEffect(() => {
    if (!open) return
    const p = panel.current
    const t = toggle.current
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return }
      if (e.key !== 'Tab' || !p) return
      const f = [...p.querySelectorAll<HTMLElement>('a, button')]
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    addEventListener('keydown', k)
    document.body.classList.add('locked')
    const id = setTimeout(() => p?.querySelector<HTMLElement>('.drawer-x')?.focus({ preventScroll: true }), 80)
    return () => { clearTimeout(id); removeEventListener('keydown', k); document.body.classList.remove('locked'); t?.focus({ preventScroll: true }) }
  }, [open])

  // arrastar o painel para a direita também fecha
  const onDown = (e: PointerEvent) => { if (e.pointerType !== 'mouse') drag.current = { x: e.clientX, y: e.clientY, dx: 0, on: false } }
  const onMove = (e: PointerEvent) => {
    const d = drag.current, p = panel.current
    if (!d || !p) return
    const dx = e.clientX - d.x, dy = e.clientY - d.y
    if (!d.on && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) d.on = true
    if (!d.on) return
    d.dx = Math.max(0, dx)
    p.style.transition = 'none'
    p.style.transform = `translateX(${d.dx}px)`
  }
  const onUp = () => {
    const d = drag.current, p = panel.current
    drag.current = null
    if (!d || !p || !d.on) return
    p.style.transition = ''
    p.style.transform = ''
    if (d.dx > p.offsetWidth * 0.28) setOpen(false)
  }

  return (
    <>
      <header className="hdr">
        <div className="wrap flex h-full items-center justify-between gap-6">
          <a href="#inicio" className="flex items-center gap-3 no-underline" aria-label="II CMMEB, início">
            <LogoMark className="h-9 w-9" />
            <span className="whitespace-nowrap font-black tracking-tight t-body leading-none">II CMMEB</span>
          </a>
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {LINKS.map(([h, l]) => (
                <li key={h}><a className="nav-l" href={h} aria-current={current === h ? 'true' : undefined}>{l}</a></li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#inscricoes" className="btn btn-sun !min-h-[44px] !px-5 hidden sm:inline-flex">Inscrições <Arrow /></a>
            <button
              ref={toggle}
              type="button"
              className="burger lg:hidden"
              aria-expanded={open}
              aria-controls="menu-panel"
              aria-label="Abrir menu"
              onClick={() => setOpen(true)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
      <div className="drawer-scrim lg:hidden" data-open={open} onClick={() => setOpen(false)} aria-hidden="true" />
      <nav
        ref={panel}
        id="menu-panel"
        className="drawer lg:hidden"
        data-open={open}
        aria-label="Menu"
        aria-hidden={!open}
        inert={!open}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="drawer-top">
          <a href="#inicio" onClick={() => setOpen(false)} className="flex items-center gap-3 no-underline" aria-label="II CMMEB, início">
            <LogoMark className="h-9 w-9" />
            <span className="font-black leading-none tracking-tight t-body">II CMMEB</span>
          </a>
          <button type="button" className="drawer-x" aria-label="Fechar menu" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="drawer-body">
          {DRAWER.map((g, gi) => (
            <div key={g.title} className="drawer-group">
              <p className="drawer-label" style={{ '--i': gi * 4 } as CSSProperties}>{g.title}</p>
              <ul>
                {g.links.map(([h, l, c], i) => (
                  <li key={h} style={{ '--i': gi * 4 + i + 1, '--dot': c } as CSSProperties}>
                    <a href={h} onClick={() => setOpen(false)} aria-current={current === h ? 'true' : undefined} className={gi === 0 ? 'big' : undefined}>
                      <span className="drawer-dot" aria-hidden="true" />
                      <span>{l}</span>
                      <Arrow className="drawer-arrow" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="drawer-foot" style={{ '--i': 11 } as CSSProperties}>
          <a href="#inscricoes" onClick={() => setOpen(false)} className="btn btn-sun w-full justify-between">Quero me inscrever <Arrow /></a>
          <p className="t-small mt-3 text-sky">Salinópolis, Pará · 2027</p>
        </div>
      </nav>
    </>
  )
}
