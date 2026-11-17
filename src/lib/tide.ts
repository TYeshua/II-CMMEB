// Simulação de maré semidiurna na costa de Salinópolis: modelo harmônico simplificado (M2 + S2).
// Amplitude de sizígia em torno de 5 m. A fase não é calibrada com a tábua de marés: não serve para navegação.
const H = 3600e3
const M2 = 12.4206 * H
const S2 = 12 * H
// fase de referência arbitrária (preamar em 2026-01-03 06:10 -03)
const T0 = Date.UTC(2026, 0, 3, 9, 10)
export const TIDE_MEAN = 2.8

export function tideAt(t: number): number {
  const a = (2 * Math.PI * (t - T0)) / M2
  const b = (2 * Math.PI * (t - T0)) / S2
  return TIDE_MEAN + 2 * Math.cos(a) + 0.65 * Math.cos(b)
}

export function tideNow() {
  const now = Date.now()
  const h = tideAt(now)
  const rising = tideAt(now + 10 * 60e3) > h
  return { h, rising, time: now }
}

export const fmtM = (m: number) => m.toFixed(1).replace('.', ',') + ' m'

export function slzClock(t = Date.now()) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Belem' }).format(t)
}

// Fase lunar astronômica real (algoritmo de Jean Meeus): elongação eclíptica Sol-Lua a partir de J2000.0.
const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0)
const DAY = 86400e3
const RAD = Math.PI / 180
const TAU = Math.PI * 2

export type MoonInfo = {
  /** Fração do ciclo sinódico (0 = Lua nova, 0.25 = Quarto crescente, 0.5 = Lua cheia, 0.75 = Quarto minguante). */
  phase: number
  /** Fração do disco visível iluminada pelo Sol (0..1). */
  illum: number
  /** Percentual iluminado (0..100). */
  pct: number
  /** Nome da fase atual em português. */
  name: string
  /** true na metade crescente do ciclo (nova → cheia). */
  waxing: boolean
}

export function moonAt(t = Date.now()): MoonInfo {
  const T = (t - J2000) / DAY / 36525
  const D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T * T) * RAD
  const M = (357.5291092 + 35999.0502909 * T - 0.0001536 * T * T) * RAD
  const Mp = (134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) * RAD
  const elong = D + (
    6.289 * Math.sin(Mp) -
    2.100 * Math.sin(M) +
    1.274 * Math.sin(2 * D - Mp) +
    0.658 * Math.sin(2 * D) -
    0.214 * Math.sin(2 * Mp) -
    0.110 * Math.sin(D)
  ) * RAD
  const phase = (((elong % TAU) + TAU) % TAU) / TAU
  const illum = (1 - Math.cos(phase * TAU)) * 0.5
  const pct = Math.round(illum * 100)
  const name =
    phase < 0.03 || phase >= 0.97 ? 'Lua nova' :
    phase < 0.22 ? 'Lua crescente' :
    phase < 0.28 ? 'Quarto crescente' :
    phase < 0.47 ? 'Crescente gibosa' :
    phase < 0.53 ? 'Lua cheia' :
    phase < 0.72 ? 'Minguante gibosa' :
    phase < 0.78 ? 'Quarto minguante' :
    'Lua minguante'
  return { phase, illum, pct, name, waxing: phase < 0.5 }
}

export function moonNow() {
  return moonAt(Date.now())
}
