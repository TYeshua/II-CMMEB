import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { cloud, push, type Cloud } from './dots'

// A coluna de perfuração e o que ela atravessa, em unidades locais da plataforma (y = 0 na superfície).
export const SEABED = -300
export const BOTTOM = -350

const C = (h: string) => new THREE.Color(h)

/** Tubo de perfuração: cilindro de pontos com juntas mais largas a cada 12 unidades. */
export function drillPipe(small: boolean) {
  const c = cloud()
  const ring = small ? 14 : 22, dy = small ? 0.5 : 0.32
  for (let y = 2; y > BOTTOM; y -= dy) {
    const joint = ((y % 12) + 12) % 12 < 1.1
    const r = joint ? 1.25 : 0.85
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2 + y * 0.35
      const lit = Math.cos(a - 0.6) // um lado mais claro: dá volume ao tubo
      push(c, Math.cos(a) * r, y, Math.sin(a) * r, joint ? '#ffd27a' : lit > 0.3 ? '#cdeef5' : '#8fd3e8', joint ? 1.2 : 0.75 + lit * 0.25)
    }
  }
  return c
}

/** Riser: tubo largo e mais apagado, da plataforma até o BOP no leito. */
export function riser(small: boolean) {
  const c = cloud()
  const ring = small ? 16 : 28
  for (let y = -1; y > SEABED + 9; y -= small ? 1.4 : 0.9) {
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2 + y * 0.05
      push(c, Math.cos(a) * 2.6, y, Math.sin(a) * 2.6, '#2a9fbd', 0.7)
    }
  }
  return c
}

function sampleBox(c: Cloud, w: number, h: number, d: number, x: number, y: number, z: number, n: number, color: string, size = 1) {
  const s = new MeshSurfaceSampler(new THREE.Mesh(new THREE.BoxGeometry(w, h, d))).build()
  const p = new THREE.Vector3()
  for (let i = 0; i < n; i++) { s.sample(p); push(c, p.x + x, p.y + y, p.z + z, color, size) }
}

/** BOP e cabeça de poço no leito. */
export function bop() {
  const c = cloud()
  sampleBox(c, 7, 4, 7, 0, SEABED + 2, 0, 900, '#f5a524', 1.1)
  sampleBox(c, 5, 3.5, 5, 0, SEABED + 5.8, 0, 600, '#e0622a', 1.1)
  sampleBox(c, 3.6, 2.4, 3.6, 0, SEABED + 8.6, 0, 380, '#ffd27a', 1.1)
  for (let i = 0; i < 40; i++) push(c, (Math.random() - 0.5) * 6, SEABED + 4 + Math.random() * 3, 3.6, '#ffffff', 1.8)
  return c
}

/** Broca tricônica em pontos, com a ponta em y = 0. */
export function bit() {
  const c = cloud()
  const body = new THREE.CylinderGeometry(1.5, 1.9, 2.6, 24, 1, true)
  const s = new MeshSurfaceSampler(new THREE.Mesh(body)).build()
  const p = new THREE.Vector3()
  for (let i = 0; i < 900; i++) { s.sample(p); push(c, p.x, p.y + 3.4, p.z, i % 3 ? '#f5a524' : '#ffd27a', 1) }
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2
    const cone = new THREE.ConeGeometry(1.1, 2.4, 16, 1, true)
    cone.rotateZ(Math.PI)
    cone.rotateX(0.5)
    cone.rotateY(-a)
    cone.translate(Math.cos(a) * 0.9, 1.2, Math.sin(a) * 0.9)
    const cs = new MeshSurfaceSampler(new THREE.Mesh(cone)).build()
    for (let i = 0; i < 520; i++) { cs.sample(p); push(c, p.x, p.y, p.z, Math.random() > 0.8 ? '#ffffff' : '#e0622a', 1.1) }
  }
  return c
}

/** Cascalho que sobe pelo espaço anular enquanto a broca corta a rocha (use com flare: true). */
export function cuttings(n: number) {
  const c = cloud()
  const cols = ['#f5a524', '#e0622a', '#ffd27a', '#8fd3e8']
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, r = 1.6 + Math.random() * 1.6
    push(c, Math.cos(a) * r, Math.random() * 1.5, Math.sin(a) * r, cols[i % 4], 0.9 + Math.random() * 0.8, 3.2)
  }
  return c
}

/** Leito marinho: disco ondulado com seixos, e um anel claro onde o poço começa. */
export function seabed(small: boolean) {
  const c = cloud()
  const st = small ? 0.8 : 0.5
  for (let x = -80; x <= 30; x += st) for (let z = -45; z <= 8; z += st) {
    if (x * x + z * z < 9) continue
    const y = SEABED + Math.sin(x * 0.07) * 1.4 + Math.cos(z * 0.09 + x * 0.03) * 1.2 + (Math.random() - 0.5) * 0.4
    const pebble = Math.random() > 0.985
    push(c, x + (Math.random() - 0.5) * st, y + (pebble ? 0.6 : 0), z + (Math.random() - 0.5) * st, pebble ? '#cdeef5' : Math.random() > 0.5 ? '#2a9fbd' : '#1b6ba3', pebble ? 1.4 : 0.9)
  }
  return c
}

/**
 * Camadas de rocha abaixo do leito, numa parede atrás do poço (corte geológico).
 * Use com HOLE: os pontos em |x| pequeno acima da broca somem, abrindo o furo.
 */
export function strata(small: boolean) {
  const c = cloud()
  // a formação inteira em laranja, amarelo e vermelho, escurecendo com a profundidade
  const layers: [number, string, string][] = [
    [SEABED, '#ffd27a', '#fff1c9'], // sedimento
    [SEABED - 8, '#f5a524', '#ffd27a'], // arenito
    [SEABED - 16, '#e0622a', '#f5a524'], // folhelho
    [SEABED - 24, '#ffb940', '#ffd27a'], // arenito
    [SEABED - 32, '#d33a2c', '#e0622a'], // carbonato
    [SEABED - 41, '#c4352a', '#e0622a'], // rocha mais funda
  ]
  const st = small ? 0.4 : 0.22
  for (let y = SEABED - 0.5; y > BOTTOM - 14; y -= st) {
    const L = [...layers].reverse().find(l => y <= l[0]) ?? layers[0]
    const base = C(L[1]), hi = C(L[2])
    for (let x = -58; x <= 22; x += st) {
      const wav = Math.sin(x * 0.05 + y * 0.2) * 0.6
      const z = -4 - Math.random() * 6
      const col = base.clone().lerp(hi, Math.random() * 0.6).multiplyScalar(0.7 + Math.random() * 0.4)
      push(c, x + (Math.random() - 0.5) * st, y + wav, z, col, 1)
    }
  }
  return c
}

/** Neve marinha e brilhos ao longo de toda a coluna d'água. */
export function waterColumn(small: boolean) {
  const c = cloud()
  for (let i = 0; i < (small ? 5000 : 12000); i++) {
    const y = -2 - Math.random() * (SEABED * -1 - 4)
    const deepness = -y / -SEABED
    const bio = deepness > 0.45 && Math.random() > 0.93 // bioluminescência no escuro
    push(c, (Math.random() - 0.5) * 120, y, -60 + Math.random() * 90, bio ? (Math.random() > 0.5 ? '#f5a524' : '#8fd3e8') : '#cdeef5', bio ? 1.6 : 0.5 + Math.random() * 0.8)
  }
  return c
}

/** Feixes de luz que entram pela superfície e somem com a profundidade. */
export function lightRays(small: boolean) {
  const c = cloud()
  for (let r = 0; r < (small ? 7 : 12); r++) {
    const ox = -50 + Math.random() * 100, oz = -50 + Math.random() * 40, slant = 0.2 + Math.random() * 0.15
    for (let i = 0; i < 420; i++) {
      const d = Math.pow(Math.random(), 1.6) * 110, fade = 1 - d / 110
      push(c, ox + d * slant + (Math.random() - 0.5) * 2.2, -d, oz + (Math.random() - 0.5) * 2.2, C('#cdeef5').multiplyScalar(0.15 + 0.7 * fade), 0.9)
    }
  }
  return c
}
