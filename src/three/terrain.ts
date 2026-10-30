// Relevo esquemático da Margem Equatorial, do Amapá (x=0) ao Rio Grande do Norte (x=1000).
// Coordenadas de planta: y cresce para o sul (continente). Não é batimetria real.
import { basins } from '../data/content'

const COAST: [number, number][] = [
  [0, 118], [50, 124], [100, 140], [130, 160], [165, 178], [200, 186], [235, 192], [300, 203],
  [380, 214], [395, 226], [410, 230], [425, 226], [450, 219], [530, 226], [610, 230], [680, 226],
  [750, 222], [830, 217], [920, 212], [960, 218], [1000, 250],
]

export function coastY(x: number) {
  for (let i = 1; i < COAST.length; i++) {
    const [x1, y1] = COAST[i]
    if (x <= x1) {
      const [x0, y0] = COAST[i - 1]
      const t = (x - x0) / (x1 - x0)
      return y0 + (y1 - y0) * t
    }
  }
  return COAST[COAST.length - 1][1]
}

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
const noise = (x: number, y: number) =>
  Math.sin(x * 0.07 + Math.sin(y * 0.05) * 2) * 0.5 + Math.sin(y * 0.11 - x * 0.03) * 0.3 + Math.sin((x + y) * 0.21) * 0.2

/** Elevação em metros (negativa no mar). */
export function elevation(x: number, y: number) {
  const d = coastY(x) - y // distância para o mar (positiva ao norte)
  if (d < 0) return Math.min(-d * 0.7, 70) + noise(x, y) * 6 + 2
  const W = 160 - 105 * ss(250, 750, x) // largura da plataforma
  if (d < W) return -(100 * Math.pow(d / W, 1.25) + noise(x * 2, y * 2) * 4)
  const canyon = Math.pow(Math.max(0, Math.sin(x * 0.115 + Math.sin(x * 0.03) * 2)), 8)
  const s = d - W
  if (s < 46) return -(100 + 2100 * ss(0, 46, s) + canyon * 420 * (1 - ss(30, 46, s)))
  const fan = x < 260 ? (1 - ss(120, 260, x)) * 500 : 0 // leque do Amazonas
  return -Math.min(4300, 2200 + (s - 46) * 9 - fan + noise(x, y * 1.5) * 90)
}

export const WORLD = { sx: 0.1, sy: 0.1, ox: 500, oy: 140, vz: 9 / 4300 }
export const toWorld = (x: number, y: number, e: number): [number, number, number] => [
  (x - WORLD.ox) * WORLD.sx,
  e < 0 ? e * WORLD.vz : e * 0.012,
  (y - WORLD.oy) * WORLD.sy,
]

export type TerrainData = {
  positions: Float32Array
  depth: Float32Array // 0 = terra, 0..1 = raso..profundo (terra negativa)
  basin: Float32Array // índice da bacia ou -1
  count: number
  coast: Float32Array
}

export function buildTerrain(step = 3.4): TerrainData {
  const pts: number[] = [], dep: number[] = [], bas: number[] = []
  for (let y = -130; y <= 290; y += step) {
    for (let x = 0; x <= 1000; x += step) {
      const jx = x + (hash(x, y) - 0.5) * step * 0.6
      const jy = y + (hash(y, x) - 0.5) * step * 0.6
      const e = elevation(jx, jy)
      if (e > 0 && coastY(jx) - jy < -150) continue // pouco interior
      const [wx, wy, wz] = toWorld(jx, jy, e)
      pts.push(wx, wy, wz)
      dep.push(e < 0 ? Math.min(1, -e / 4300) : -Math.min(1, e / 70))
      let b = -1
      if (e < -60) basins.forEach((bs, i) => {
        const dx = (jx - bs.cx) / (bs.rx * 1.25), dy = (jy - bs.cy + 30) / (bs.ry * 2.4)
        if (dx * dx + dy * dy < 1) b = i
      })
      bas.push(b)
    }
  }
  const coast: number[] = []
  for (let x = 0; x <= 1000; x += 4) { const [a, b, c] = toWorld(x, coastY(x), 0); coast.push(a, b + 0.05, c) }
  return {
    positions: new Float32Array(pts), depth: new Float32Array(dep), basin: new Float32Array(bas),
    count: pts.length / 3, coast: new Float32Array(coast),
  }
}

// sede do congresso: Salinópolis, no litoral nordeste do Pará (≈ 0°37′S 47°21′W)
export const SEDE = toWorld(228, coastY(228), 0)
export const basinCenter = (i: number) => {
  const b = basins[i]
  return toWorld(b.cx, b.cy - 30, elevation(b.cx, b.cy - 30))
}
