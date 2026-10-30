import { useEffect, useRef, useState, type RefObject } from 'react'

export const prefersReduced = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function useReducedMotion() {
  const [r, setR] = useState(prefersReduced)
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setR(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return r
}

export function useMedia(q: string) {
  const [m, setM] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches)
  useEffect(() => {
    const mq = matchMedia(q)
    const on = () => setM(mq.matches)
    on(); mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

/** Progresso 0..1 de rolagem de um elemento alto com conteúdo sticky. */
export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const span = r.height - innerHeight
      setP(span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    addEventListener('scroll', on, { passive: true })
    addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [ref])
  return p
}

/** Marca [data-reveal] como visível quando entra na tela (uma vez). */
export function useRevealAll() {
  useEffect(() => {
    const seen = new WeakSet<Element>()
    if (!('IntersectionObserver' in window)) {
      document.documentElement.classList.remove('js')
      return
    }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 })
    const scan = () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(el => {
      if (!seen.has(el)) { seen.add(el); io.observe(el) }
    })
    scan()
    // abas e dias trocam conteúdo: observa o que entra depois
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [])
}

export function useNow(interval = 1000) {
  const [t, setT] = useState(() => Date.now())
  useEffect(() => { const id = setInterval(() => setT(Date.now()), interval); return () => clearInterval(id) }, [interval])
  return t
}

export function useInView<T extends Element>(margin = '200px') {
  const ref = useRef<T>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return [ref, v] as const
}

/** Atraso da entrada escalonada (multiplicado por 75 ms no CSS). */
export const delay = (n: number) => ({ '--d': n }) as import('react').CSSProperties
