import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { cloud, push, type Cloud } from './dots'

// Modelos em pontos, amostrados na superfície de formas simples. Unidade ≈ metro estilizado.

const M = new THREE.Matrix4()
const at = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, s: [number, number, number] = [1, 1, 1]) =>
  M.clone().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(...s))

function merged(parts: [THREE.BufferGeometry, THREE.Matrix4][]) {
  return mergeGeometries(parts.map(([g, m]) => {
    const c = (g.index ? g.toNonIndexed() : g.clone())
    for (const k of Object.keys(c.attributes)) if (k !== 'position') c.deleteAttribute(k)
    return c.applyMatrix4(m)
  }))!
}

function sample(c: Cloud, geo: THREE.BufferGeometry, n: number, color: string | ((p: THREE.Vector3) => string), size = 1, flap?: (p: THREE.Vector3) => number) {
  const s = new MeshSurfaceSampler(new THREE.Mesh(geo)).build()
  const p = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    s.sample(p)
    push(c, p.x, p.y, p.z, typeof color === 'string' ? color : color(p), size, flap ? flap(p) : 0)
  }
}

function line(c: Cloud, a: THREE.Vector3, b: THREE.Vector3, step: number, color: string, size = 1) {
  const n = Math.max(2, Math.ceil(a.distanceTo(b) / step))
  for (let i = 0; i <= n; i++) { const p = a.clone().lerp(b, i / n); push(c, p.x, p.y, p.z, color, size) }
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

/* ---------------- plataforma semissubmersível (o centro) ---------------- */
export function platform(density = 1) {
  const c = cloud()
  const n = (k: number) => Math.round(k * density)
  const hull: [THREE.BufferGeometry, THREE.Matrix4][] = []
  for (const x of [-4.2, 4.2]) {
    hull.push([new THREE.BoxGeometry(2.2, 1.6, 15), at(x, -2.6, 0)])
    for (const z of [-5.5, 5.5]) hull.push([new THREE.CylinderGeometry(1, 1.1, 8, 20, 1, true), at(x, 1.6, z)])
  }
  sample(c, merged(hull), n(2600), p => (p.y < 0.2 ? '#1b6ba3' : '#f5a524'), 1)
  const deck = merged([
    [new THREE.BoxGeometry(12, 1.8, 14), at(0, 6.4, 0)],
    [new THREE.BoxGeometry(5, 2.4, 5), at(-2.8, 8.5, 3.2)],
    [new THREE.BoxGeometry(3.4, 1.6, 4), at(3.4, 8.1, 4)],
    [new THREE.CylinderGeometry(3.2, 3.2, 0.25, 16), at(-4.6, 10.2, 4.6)],
    [new THREE.BoxGeometry(0.4, 0.4, 11), at(5.2, 10.5, -1, 0.55, 0.4, 0)],
  ])
  sample(c, deck, n(3600), p => (p.y > 9.9 && p.x < -1.5 ? '#f2f9fb' : p.y > 7.3 ? '#ffc768' : '#f5a524'), 1)
  // torre de perfuração em treliça
  const H = 15, b0 = 1.8, b1 = 0.45, base = 7.3, ox = 1.5, oz = -2
  const corner = (h: number, sx: number, sz: number) => { const w = b0 + (b1 - b0) * (h / H); return V(ox + sx * w, base + h, oz + sz * w) }
  const cs: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
  for (let i = 0; i < 4; i++) line(c, corner(0, ...cs[i]), corner(H, ...cs[i]), 0.22 / density, '#ffd27a', 1.1)
  for (let k = 0; k < 6; k++) {
    const h0 = (k / 6) * H, h1 = ((k + 1) / 6) * H
    for (let i = 0; i < 4; i++) {
      line(c, corner(h0, ...cs[i]), corner(h0, ...cs[(i + 1) % 4]), 0.3 / density, '#f5a524', 0.9)
      line(c, corner(h0, ...cs[i]), corner(h1, ...cs[(i + 1) % 4]), 0.3 / density, '#f5a524', 0.9)
    }
  }
  // braço do flare
  line(c, V(6, 7.2, -5.4), V(14.2, 12.2, -5.4), 0.2 / density, '#ffd27a', 1)
  // luzes do convés
  for (const [x, y, z] of [[-5.8, 7.6, 6.8], [5.8, 7.6, 6.8], [-5.8, 7.6, -6.8], [5.8, 7.6, -6.8], [-2.8, 9.9, 5.8], [3.4, 9, 6.1], [1.5, 22.4, -2]])
    for (let i = 0; i < 6; i++) push(c, x + (Math.random() - 0.5) * 0.3, y + (Math.random() - 0.5) * 0.3, z, '#ffffff', 2.2)
  return c
}

/** Chama do flare (use com flare: true). */
export function flame(n = 260) {
  const c = cloud()
  for (let i = 0; i < n; i++) push(c, 14.4 + (Math.random() - 0.5) * 0.5, 12.4, -5.4 + (Math.random() - 0.5) * 0.5, Math.random() > 0.5 ? '#f5a524' : '#e0622a', 1.5 + Math.random() * 1.5, 1)
  return c
}

/** Riser e amarras abaixo da superfície. */
export function subsea(depth = 40) {
  const c = cloud()
  line(c, V(1.5, -3, -2), V(1.5, -depth, -2), 0.35, '#8fd3e8', 1)
  for (const [x, z] of [[-4.2, -7], [4.2, -7], [-4.2, 7], [4.2, 7]]) line(c, V(x, -2.5, z), V(x * 4, -depth, z * 4), 0.45, '#2a9fbd', 0.8)
  return c
}

/* ---------------- o que orbita a indústria ---------------- */
function curvePts(c: Cloud, pts: THREE.Vector3[], n: number, color: string, r = 0.08) {
  const cur = new THREE.CatmullRomCurve3(pts)
  for (let i = 0; i < n; i++) { const p = cur.getPoint(i / n); push(c, p.x + (Math.random() - 0.5) * r, p.y + (Math.random() - 0.5) * r, p.z + (Math.random() - 0.5) * r, color, 1) }
}

export function mangrove() {
  const c = cloud()
  for (const [tx, s] of [[-1.6, 1], [1.4, 0.85]] as [number, number][]) {
    curvePts(c, [V(tx, -0.2, 0), V(tx, 3.2 * s, 0)], 60, '#2a9fbd')
    for (let r = 0; r < 6; r++) {
      const a = (r / 6) * Math.PI * 2, dx = Math.cos(a) * 1.4 * s, dz = Math.sin(a) * 1.4 * s
      curvePts(c, [V(tx, 1.6 * s, 0), V(tx + dx * 0.5, 1.2 * s, dz * 0.5), V(tx + dx, -0.2, dz)], 34, '#2a9fbd')
    }
    const can = merged([
      [new THREE.SphereGeometry(1.3 * s, 14, 10), at(tx - 0.9 * s, 3.6 * s, 0)],
      [new THREE.SphereGeometry(1.5 * s, 14, 10), at(tx + 0.8 * s, 3.8 * s, 0.3)],
      [new THREE.SphereGeometry(1.6 * s, 14, 10), at(tx, 4.6 * s, -0.2)],
    ])
    // copa em azul do mar, com luz só no alto: a nuvem densa não estoura
    sample(c, can, 400, p => (p.y > 4.9 * s ? '#8fd3e8' : p.y > 3.9 * s ? '#2a9fbd' : '#1b6ba3'))
  }
  return c
}

export function reef() {
  const c = cloud()
  const cols = ['#d33a2c', '#f5a524', '#e0622a', '#ff8a76']
  for (let k = 0; k < 7; k++) {
    const bx = (Math.random() - 0.5) * 4, bz = (Math.random() - 0.5) * 2, col = cols[k % 4]
    for (let j = 0; j < 5; j++) {
      const ang = (Math.random() - 0.5) * 1.2, h = 1 + Math.random() * 1.8
      curvePts(c, [V(bx, 0, bz), V(bx + Math.sin(ang) * h * 0.4, h * 0.6, bz), V(bx + Math.sin(ang) * h, h, bz + (Math.random() - 0.5) * 0.6)], 22, col, 0.12)
    }
  }
  sample(c, merged([[new THREE.SphereGeometry(1.1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), at(1.6, 0, 0.8)], [new THREE.SphereGeometry(0.8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), at(-1.8, 0, -0.4)]]), 320, '#ff8a76')
  sample(c, merged([[new THREE.CircleGeometry(1.4, 20, 0, Math.PI), at(0.2, 0, -0.9)]]), 220, '#e0622a')
  return c
}

export function ibisFlock() {
  const c = cloud()
  const offs: [number, number, number][] = [[0, 0, 0], [-1.6, -0.3, -1.4], [1.6, -0.2, -1.5], [-3.1, -0.5, -2.8], [3.2, -0.4, -2.9]]
  for (const [ox, oy, oz] of offs) {
    for (let i = 0; i < 40; i++) { const t = Math.random(); push(c, ox + (Math.random() - 0.5) * 0.18, oy + (Math.random() - 0.5) * 0.18, oz + 0.7 - t * 1.6, '#ff4a36', 1) }
    for (let i = 0; i < 12; i++) { const t = Math.random(); push(c, ox, oy - 0.05 - t * 0.25, oz + 0.75 + t * 0.6, '#ff8a76', 0.8) } // bico curvo
    for (let i = 0; i < 90; i++) {
      const side = i % 2 ? 1 : -1, s = Math.random(), w = Math.random()
      const x = side * (0.15 + s * 1.5), z = oz + 0.25 - w * 0.7 * (1 - s * 0.5)
      push(c, ox + x, oy, z, s > 0.8 ? '#7a1d16' : '#ff4a36', 1, s * 0.55)
    }
  }
  return c
}

export function fishSchool() {
  const c = cloud()
  for (let f = 0; f < 46; f++) {
    const a = Math.random() * Math.PI * 2, r = 0.8 + Math.random() * 2.2, y = (Math.random() - 0.5) * 2.2
    const cx = Math.cos(a) * r, cz = Math.sin(a) * r * 0.7, dir = a + Math.PI / 2
    for (let i = 0; i < 9; i++) { const t = i / 8 - 0.5; push(c, cx + Math.cos(dir) * t * 0.5, y, cz + Math.sin(dir) * t * 0.5, i === 0 ? '#f2f9fb' : '#cdeef5', 0.8) }
  }
  return c
}

export function biana() {
  const c = cloud()
  const hull = new THREE.CylinderGeometry(0.5, 0.5, 4.4, 14, 1, true, 0, Math.PI)
  sample(c, merged([[hull, at(0, 0.5, 0, 0, 0, Math.PI / 2, [1, 1, 0.45])]]), 360, '#cdeef5')
  curvePts(c, [V(-0.3, 0.4, 0), V(-0.3, 4.2, 0)], 60, '#f2f9fb', 0.03)
  const sail = new THREE.BufferGeometry()
  sail.setAttribute('position', new THREE.Float32BufferAttribute([-0.2, 4.1, 0, -0.2, 0.9, 0, 2, 0.9, 0], 3))
  sample(c, sail, 420, p => (p.y > 2.6 ? '#f5a524' : '#e0622a'))
  return c
}
