import * as THREE from 'three'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import mask from './margin-mask.json'
import regionsData from './margin-regions.json'

/*
  Geografia da cena: o planeta (raio 358, 1 unidade ≈ 17,8 km), a costa real da Margem Equatorial
  (Natural Earth 1:50m, pré-processada em margin-mask.json) e uma batimetria esquemática
  calculada pela distância até a costa. Profundidades exageradas (~35×).
*/

export const DEG = Math.PI / 180
export const R = 358
const LON_C = -46 * DEG
export const VZ = 9 / 4300 // unidades por metro de profundidade
export const SITE = { lat: 4.2, lon: -48.6 } // águas profundas da bacia da Foz do Amazonas (posição ilustrativa)

export const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Direção na esfera; a margem (lat 0, lon -46) fica de frente para +z e o norte aponta para +y. */
export const dir = (lat: number, lon: number, out = new THREE.Vector3()) => {
  const p = lat * DEG, l = lon * DEG - LON_C
  return out.set(Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l))
}

/* ---------- máscara regional (Natural Earth 1:50m) e distância à costa ---------- */
type Mask = { lon0: number; lat1: number; ppd: number; w: number; h: number; rows: number[][] }
export function regional() {
  const m = mask as Mask
  const land = new Uint8Array(m.w * m.h)
  m.rows.forEach((r, y) => { for (let k = 0; k < r.length; k += 2) land.fill(1, y * m.w + r[k], y * m.w + r[k + 1]) })
  // distância (em pixels) até o pixel de tipo oposto mais próximo: transformada de chanfro em duas passadas
  const INF = 1e6, dist = new Float32Array(m.w * m.h)
  for (let i = 0; i < dist.length; i++) {
    const x = i % m.w, y = (i / m.w) | 0, v = land[i]
    const edge = (x > 0 && land[i - 1] !== v) || (x < m.w - 1 && land[i + 1] !== v) || (y > 0 && land[i - m.w] !== v) || (y < m.h - 1 && land[i + m.w] !== v)
    dist[i] = edge ? 0 : INF
  }
  const D = Math.SQRT2
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const i = y * m.w + x; let d = dist[i]
    if (x > 0) d = Math.min(d, dist[i - 1] + 1)
    if (y > 0) { d = Math.min(d, dist[i - m.w] + 1); if (x > 0) d = Math.min(d, dist[i - m.w - 1] + D); if (x < m.w - 1) d = Math.min(d, dist[i - m.w + 1] + D) }
    dist[i] = d
  }
  for (let y = m.h - 1; y >= 0; y--) for (let x = m.w - 1; x >= 0; x--) {
    const i = y * m.w + x; let d = dist[i]
    if (x < m.w - 1) d = Math.min(d, dist[i + 1] + 1)
    if (y < m.h - 1) { d = Math.min(d, dist[i + m.w] + 1); if (x < m.w - 1) d = Math.min(d, dist[i + m.w + 1] + D); if (x > 0) d = Math.min(d, dist[i + m.w - 1] + D) }
    dist[i] = d
  }
  const kmPerPx = 111.2 / m.ppd
  const at = (lat: number, lon: number) => {
    const x = Math.min(m.w - 1, Math.max(0, Math.floor((lon - m.lon0) * m.ppd)))
    const y = Math.min(m.h - 1, Math.max(0, Math.floor((m.lat1 - lat) * m.ppd)))
    const i = y * m.w + x
    return { land: land[i] === 1, km: dist[i] * kmPerPx }
  }
  const inside = (lat: number, lon: number) => lon >= m.lon0 && lon < m.lon0 + m.w / m.ppd && lat <= m.lat1 && lat > m.lat1 - m.h / m.ppd
  return { at, inside }
}

export const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }

/** Profundidade esquemática (m) a partir da distância à costa e da longitude. */
export function depthAt(km: number, lat: number, lon: number) {
  const W = 300 - 240 * smooth(-49, -39, lon) // plataforma larga a oeste, estreita a leste
  if (km < W) return 100 * Math.pow(km / W, 1.3) + Math.sin(lon * 9 + lat * 7) * 4
  const s = km - W
  const canyon = Math.pow(Math.max(0, Math.sin(lon * 6.5 + Math.sin(lat * 3) * 2)), 10) * 420
  if (s < 70) return 100 + 2200 * smooth(0, 70, s) + canyon * (1 - smooth(45, 70, s))
  const fan = lon < -46 ? (1 - smooth(-50, -46, lon)) * 600 : 0 // leque do Amazonas
  return Math.min(4300, 2300 + (s - 70) * 6 - fan + Math.sin(lon * 3 + lat * 5) * 90)
}

/** Máscara global (Natural Earth 1:110m) para o planeta inteiro: terra e Brasil. */
export async function globalMask(W = 2048, H = 1024) {
  const topo = (await import('world-atlas/countries-110m.json')).default as unknown as Topology
  const fc = feature(topo, topo.objects.countries as GeometryCollection)
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const g = cv.getContext('2d', { willReadFrequently: true })!
  for (const f of fc.features) {
    const geom = f.geometry
    if (!geom) continue
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : []
    g.fillStyle = f.id === '076' ? 'rgb(255,255,0)' : 'rgb(255,0,0)'
    for (const poly of polys) {
      g.beginPath()
      for (const ring of poly) {
        let prev: number | null = null
        ring.forEach(([lon, lat], i) => {
          const x = ((lon + 180) / 360) * W, y = ((90 - lat) / 180) * H
          if (i === 0 || (prev !== null && Math.abs(lon - prev) > 180)) g.moveTo(x, y); else g.lineTo(x, y)
          prev = lon
        })
        g.closePath()
      }
      g.fill('evenodd')
    }
  }
  const data = g.getImageData(0, 0, W, H).data
  return (lat: number, lon: number) => {
    const x = Math.min(W - 1, Math.max(0, Math.floor(((lon + 180) / 360) * W)))
    const y = Math.min(H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * H)))
    const i = (y * W + x) * 4
    return { land: data[i] > 127, brazil: data[i + 1] > 127 }
  }
}



/** Estados (código IBGE) e bacias marítimas (1..5, de oeste para leste) na mesma grade da costa. */
export function regions() {
  const m = mask as Mask
  const decode = (rows: number[][]) => {
    const g = new Uint8Array(m.w * m.h)
    rows.forEach((r, y) => { for (let k = 0; k < r.length; k += 3) g.fill(r[k + 2], y * m.w + r[k], y * m.w + r[k + 1]) })
    return g
  }
  const uf = decode(regionsData.states), basin = decode(regionsData.basins)
  const idx = (lat: number, lon: number) => {
    const x = Math.min(m.w - 1, Math.max(0, Math.floor((lon - m.lon0) * m.ppd)))
    const y = Math.min(m.h - 1, Math.max(0, Math.floor((m.lat1 - lat) * m.ppd)))
    return y * m.w + x
  }
  return {
    w: m.w, h: m.h, ppd: m.ppd, lon0: m.lon0, lat1: m.lat1, uf, basin,
    at: (lat: number, lon: number) => { const i = idx(lat, lon); return { uf: uf[i], basin: basin[i] } },
    centers: regionsData.centers as { nome: string; lat: number; lon: number }[],
  }
}

/** Pará, sede e o centro do mapa da margem. */
export const PARA = { lat: -5, lon: -52.4 }
export const SALINOPOLIS = { lat: -0.614, lon: -47.356 }
export const MAP_CENTER = { lat: -2.4, lon: -47.2 }
export const BASIN_COLORS = ['#f5a524', '#ffd27a', '#f5a524', '#ffd27a', '#f5a524']
