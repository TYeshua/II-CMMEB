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
