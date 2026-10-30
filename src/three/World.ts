import * as THREE from 'three'
import { cloud, disposeAll, points, push, setTime, type Cloud } from './dots'
import { bloom } from './fx'
import { BASIN_COLORS, DEG, MAP_CENTER, PARA, R, SALINOPOLIS, SITE, VZ, depthAt, dir, ease, globalMask, hash, regional, regions, smooth } from './geo'
import { biana, fishSchool, flame, ibisFlock, mangrove, platform, reef } from './models'
import { BOTTOM, SEABED, bit, bop, cuttings, drillPipe, lightRays, riser, seabed, strata, waterColumn } from './drill'

/*
  Uma única cena em pontilhismo, num só plano-sequência:
  o planeta → a Margem Equatorial (costa real) → a descida até a plataforma, que termina
  exatamente no enquadramento da tela inicial: a indústria no centro, o ambiente em órbita.
  Depois disso, a rolagem (dive 0..1) desce pelo riser até o fundo.

  O "local" (mar, plataforma, órbita) vive num grupo tangente ao globo, em unidades próprias
  (plataforma ≈ 22 de altura) e reduzido por S para caber no planeta. Tamanhos de ponto e
  distâncias de esmaecimento desse grupo são multiplicados por S.
*/

export type Label = { id: string; x: number; y: number; show: boolean; alpha?: number; depth?: number }
export type Step = (fraction: number, label: string) => void

const S = 0.09
const ORBIT: { id: string; make: () => Cloud; scale: number; flap?: boolean; y?: number }[] = [
  { id: 'mangue', make: mangrove, scale: 1.05, y: -1.5 },
  { id: 'guara', make: ibisFlock, scale: 1.15, flap: true, y: 1 },
  { id: 'recife', make: reef, scale: 1.2, y: -1 },
  { id: 'pesca', make: fishSchool, scale: 1.1 },
  { id: 'comunidade', make: biana, scale: 1, y: -1.2 },
]
const R_IN = 20, R_OUT = 28, ORBIT_Y = 10, LINK_N = 70
const FLARE = new THREE.Vector3(14.4, 12.4, -5.4)
const FLIGHT_MS = 12000
// 0–0.3: o planeta gira até o Brasil e aproxima · 0.3–0.44: o mapa do Pará e das bacias · até SPLIT: segue para a Foz
const SPLIT = 0.56 // daqui em diante, a câmera desce sobre a plataforma

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const frame = () => new Promise<void>(r => requestAnimationFrame(() => r()))

type P = THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>

export class World {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(40, 1, 0.005, 9000)
  private fx: ReturnType<typeof bloom>
  private small = innerWidth < 700
  private pr: number
  // planeta
  private planet: P[] = []
  private planetSize: number[] = []
  private halo!: P
  private sats!: P
  private stars!: P
  private region: P[] = []
  private regionSize: number[] = []
  private mapPts!: { basins: THREE.Vector3[]; para: THREE.Vector3; sede: THREE.Vector3 }
  // local
  private site = new THREE.Group()
  private siteDir = new THREE.Vector3()
  private ocean!: P
  private rigPts: P[] = []
  private sky!: P
  private water!: P
  private rays!: P
  private pipe = new THREE.Group()
  private bitGroup = new THREE.Group()
  private pipePts!: P
  private cut!: P
  private rock!: P
  private fish: THREE.Group[] = []
  private descentS = 0
  private links!: P
  private ringPts: P[] = []
  private orbit = new THREE.Group()
  private orbiters: { id: string; o: THREE.Object3D; pts: P; a0: number; y: number }[] = []
  private camPath!: THREE.CatmullRomCurve3
  private lookPath!: THREE.CatmullRomCurve3
  // estado
  private raf = 0
  private t0 = performance.now()
  private visible = true
  private playing = false
  private flightT0 = 0
  private flightK = 0
  private skipFrom = -1
  private skipT0 = 0
  private doneAt = -1
  private mouse = new THREE.Vector2()
  private look = new THREE.Vector2()
  private diveS = 0
  private w = 1
  private h = 1
  private narrow = innerWidth / innerHeight < 0.9
  private v = new THREE.Vector3()
  dive = 0
  /** Rolagem da página depois da tela inicial (0..1): a broca desce até o leito e entra na rocha. */
  descent = 0
  /** De que lado da tela fica a coluna: 1 = direita (cards à esquerda), -1 = esquerda. */
  side = 1
  private sideS = 1
  tide = 0
  speed = 1
  /** Posição atual no voo (0..1). */
  get progress() { return this.flightK }
  onLabels?: (l: Label[]) => void
  onFinish?: () => void

  constructor(private canvas: HTMLCanvasElement, private reduced: boolean) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
    this.pr = Math.min(devicePixelRatio || 1, this.small ? 1.5 : 2)
    this.renderer.setPixelRatio(this.pr)
    this.renderer.setClearColor('#06142a')
    this.fx = bloom(this.renderer, this.scene, this.camera, { strength: 0.6, radius: 0.4, threshold: 0.3 })
  }

  private add(c: Cloud, o: Parameters<typeof points>[1], into: THREE.Object3D = this.scene) {
    const p = points(c, o) as P
    into.add(p)
    return p
  }
  /** Ponto do grupo local: tamanho e esmaecimento convertidos para a escala do planeta. */
  private addLocal(c: Cloud, o: Parameters<typeof points>[1], into: THREE.Object3D) {
    return this.add(c, { ...o, size: (o.size ?? 1) * S, far: (o.far ?? 400) * S }, into)
  }

  /** Monta tudo em etapas, avisando o progresso real; termina com os shaders compilados. */
  async build(step: Step) {
    const pr = this.pr, small = this.small, v = this.v
    step(0.12, 'Lendo o mapa do mundo')
    await frame()
    const gm = await globalMask()
    step(0.24, 'Traçando a costa da Margem Equatorial')
    await frame()
    const rg = regional()

    /* ---------- o planeta ---------- */
    step(0.36, 'Distribuindo os pontos do planeta')
    await frame()
    const ocean = cloud(), land = cloud(), br = cloud(), band = cloud()
    const N = small ? 70000 : 170000
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, th = golden * i
      const lat = Math.asin(y) / DEG
      const lon = ((Math.atan2(Math.sin(th), Math.cos(th)) / DEG + 540) % 360) - 180
      const m = gm(lat, lon)
      dir(lat, lon, v).multiplyScalar(R)
      const inMargin = !m.land && rg.inside(lat, lon) && lat > -6 && lon > -54 && (() => { const r = rg.at(lat, lon); return !r.land && r.km < 260 })()
      if (inMargin) push(band, v.x, v.y, v.z, hash(i, 4) > 0.35 ? '#f5a524' : '#ffd27a', 1.1)
      else if (m.brazil) push(br, v.x, v.y, v.z, hash(i, 1) > 0.5 ? '#cdeef5' : '#8fd3e8', 1.15)
      else if (m.land) push(land, v.x, v.y, v.z, hash(i, 2) > 0.7 ? '#8fd3e8' : '#2a9fbd', 1)
      else if (hash(i, 3) < 0.42) push(ocean, v.x, v.y, v.z, '#1b6ba3', 0.85)
    }
    const grat = cloud()
    for (let lon = -180; lon < 180; lon += 15) for (let lat = -80; lat <= 80; lat += 0.6) { dir(lat, lon, v).multiplyScalar(R * 1.004); push(grat, v.x, v.y, v.z, '#2a9fbd', 0.6) }
    for (let lat = -75; lat <= 75; lat += 15) for (let lon = -180; lon < 180; lon += 0.6) { dir(lat, lon, v).multiplyScalar(R * 1.004); push(grat, v.x, v.y, v.z, lat === 0 ? '#f5a524' : '#2a9fbd', lat === 0 ? 0.9 : 0.6) }
    for (const [c, size, tw] of [[ocean, 8, 0.2], [land, 9, 0.15], [br, 10, 0.2], [grat, 7, 0.3], [band, 10, 0.4]] as const) {
      this.planet.push(this.add(c, { pr, size, far: 4000, twinkle: tw }))
      this.planetSize.push(size)
    }
    const halo = cloud()
    for (let i = 0; i < (small ? 5000 : 12000); i++) {
      v.randomDirection().multiplyScalar(R * (1.01 + Math.pow(Math.random(), 2.2) * 0.09))
      push(halo, v.x, v.y, v.z, Math.random() > 0.8 ? '#cdeef5' : '#8fd3e8', 0.7)
    }
    this.halo = this.add(halo, { pr, size: 8, far: 4000, twinkle: 0.6 })
    const sats = cloud()
    for (const [tilt, rot, r] of [[0.45, 0.3, 1.32], [-0.62, 1.4, 1.48]]) {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, rot, 0))
      for (let i = 0; i < 900; i++) {
        const a = (i / 900) * Math.PI * 2
        v.set(Math.cos(a) * R * r, 0, Math.sin(a) * R * r).applyQuaternion(q)
        push(sats, v.x, v.y, v.z, '#f5a524', 1.2, i / 900 + rot)
      }
    }
    this.sats = this.add(sats, { pr, size: 18, far: 5000, twinkle: 0, trail: { speed: 0.06, pow: 10 } })
    const stars = cloud()
    for (let i = 0; i < 4000; i++) { v.randomDirection().multiplyScalar(2500 + Math.random() * 1500); push(stars, v.x, v.y, v.z, Math.random() > 0.9 ? '#f5a524' : '#cdeef5', 0.8 + Math.random() * 2) }
    this.stars = this.add(stars, { pr, size: 50, far: 9000, twinkle: 0.7 })

    /* ---------- a margem, colada na superfície ---------- */
    step(0.52, 'Modelando o relevo da margem')
    await frame()
    const sea = cloud(), shore = cloud(), ground = cloud(), lines = cloud()
    const geo = regions()
    const st = small ? 0.075 : 0.042
    const shallow = new THREE.Color('#2a9fbd'), deepC = new THREE.Color('#0c4d79'), iso = new THREE.Color('#8fd3e8'), col = new THREE.Color(), tint = new THREE.Color()
    const ISO = [100, 1000, 2000, 3000]
    for (let lat = 6.5; lat > -10.4; lat -= st) {
      for (let lon = -59.5; lon < -32.5; lon += st) {
        const la = lat + (hash(lat, lon) - 0.5) * st * 0.7, lo = lon + (hash(lon, lat) - 0.5) * st * 0.7
        if (!rg.inside(la, lo)) continue
        const r = rg.at(la, lo), g = geo.at(la, lo)
        if (r.land) {
          if (r.km < 4) { dir(la, lo, v).multiplyScalar(R + 0.06); push(shore, v.x, v.y, v.z, hash(la, 9) > 0.4 ? '#f5a524' : '#ffd27a', 1.3) }
          else if (g.uf === 15) {
            // o Pará, onde fica a sede, inteiro e mais claro
            dir(la, lo, v).multiplyScalar(R + 0.05 + Math.min(r.km, 300) * 0.0006 + hash(lo, la) * 0.05)
            push(ground, v.x, v.y, v.z, hash(la * 5, lo * 5) > 0.7 ? '#8fd3e8' : '#2a9fbd', 0.95)
          } else if (r.km < 120 || hash(la, lo) < 0.4) {
            dir(la, lo, v).multiplyScalar(R + 0.05 + Math.min(r.km, 300) * 0.0006 + hash(lo, la) * 0.05)
            push(ground, v.x, v.y, v.z, r.km < 30 ? '#2a9fbd' : '#1b6ba3', 0.85)
          }
        } else {
          // nunca negativa: um NaN de cor numa única partícula apagaria a tela inteira no bloom
          const dm = Math.max(2, depthAt(r.km, la, lo))
          const k = Math.min(1, dm / 4300)
          col.copy(shallow).lerp(deepC, Math.pow(k, 0.55)).multiplyScalar(0.75 + hash(lo * 7, la * 7) * 0.5)
          if (g.basin) col.lerp(tint.set(BASIN_COLORS[g.basin - 1]), 0.4)
          const onIso = ISO.some(z => Math.abs(dm - z) < z * 0.035 + 12)
          if (onIso) col.copy(iso)
          dir(la, lo, v).multiplyScalar(R - dm * VZ)
          push(sea, v.x, v.y, v.z, col, onIso ? 1.25 : 1 - k * 0.25)
        }
      }
    }
    // divisas entre estados e contornos das bacias, em linha pontilhada, na superfície
    const lineStep = small ? 3 : 2
    for (let y = 1; y < geo.h - 1; y += lineStep) {
      for (let x = 1; x < geo.w - 1; x += 1) {
        const i = y * geo.w + x
        const u = geo.uf[i], bsn = geo.basin[i]
        const lat = geo.lat1 - (y + 0.5) / geo.ppd, lon = geo.lon0 + (x + 0.5) / geo.ppd
        const nb = [i - 1, i + 1, i - geo.w, i + geo.w]
        if (u && nb.some(j => geo.uf[j] && geo.uf[j] !== u) && (x + y) % 4 === 0) {
          dir(lat, lon, v).multiplyScalar(R + 0.12)
          push(lines, v.x, v.y, v.z, u === 15 || nb.some(j => geo.uf[j] === 15) ? '#f2f9fb' : '#8fd3e8', u === 15 || nb.some(j => geo.uf[j] === 15) ? 1.3 : 0.9)
        }
        if (bsn && nb.some(j => geo.basin[j] !== bsn) && (x + y) % 2 === 0) {
          dir(lat, lon, v).multiplyScalar(R + 0.04)
          push(lines, v.x, v.y, v.z, BASIN_COLORS[bsn - 1], 1.5)
        }
      }
    }
    // Salinópolis, a sede
    for (let i = 0; i < 70; i++) {
      const a = (i / 70) * Math.PI * 2
      dir(SALINOPOLIS.lat + Math.sin(a) * 0.16, SALINOPOLIS.lon + Math.cos(a) * 0.16, v).multiplyScalar(R + 0.15)
      push(lines, v.x, v.y, v.z, '#ff4a36', 1.5)
    }
    dir(SALINOPOLIS.lat, SALINOPOLIS.lon, v).multiplyScalar(R + 0.15)
    for (let i = 0; i < 24; i++) push(lines, v.x + (Math.random() - 0.5) * 0.15, v.y + (Math.random() - 0.5) * 0.15, v.z + (Math.random() - 0.5) * 0.15, '#ff4a36', 1.8)
    for (const [c, size, tw] of [[sea, 1.05, 0.15], [ground, 1.1, 0.1], [shore, 1.9, 0.35], [lines, 1.2, 0.2]] as const) {
      this.region.push(this.add(c, { pr, size, far: 4000, opacity: 0, twinkle: tw }))
      this.regionSize.push(size)
    }
    this.mapPts = { basins: geo.centers.map(c => dir(c.lat, c.lon).multiplyScalar(R)), para: dir(PARA.lat, PARA.lon).multiplyScalar(R), sede: dir(SALINOPOLIS.lat, SALINOPOLIS.lon).multiplyScalar(R) }

    /* ---------- o lugar da plataforma: um plano tangente ao globo ---------- */
    step(0.7, 'Montando a plataforma e o ambiente ao redor')
    await frame()
    dir(SITE.lat, SITE.lon, this.siteDir)
    const up = this.siteDir.clone()
    const east = new THREE.Vector3(0, 1, 0).cross(up).normalize()
    const south = new THREE.Vector3().crossVectors(east, up)
    this.site.matrixAutoUpdate = false
    this.site.matrix.makeBasis(east.multiplyScalar(S), up.clone().multiplyScalar(S), south.multiplyScalar(S)).setPosition(up.multiplyScalar(R))
    this.site.matrixWorldNeedsUpdate = true
    this.scene.add(this.site)
    this.buildLocal()

    // trajetória da descida, em unidades locais (x leste, y para cima, z sul)
    const top = 64 / S, D = this.narrow ? 92 : 70
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
    this.camPath = new THREE.CatmullRomCurve3([V(0, top, 0.1), V(45, top * 0.42, 140), V(26, 95, 150), V(8, 34, D + 30), V(0, 17, D)], false, 'centripetal')
    this.lookPath = new THREE.CatmullRomCurve3([V(0, 0, -0.1), V(0, 0, 0), V(0, 4, 0), V(0, 8, 0), V(0, 9, 0)], false, 'centripetal')

    step(0.88, 'Preparando a renderização')
    await frame()
    this.resize()
    this.renderer.compile(this.scene, this.camera)
    this.render(0)
    await frame()
    this.render(0)
    step(1, 'Pronto')
    addEventListener('resize', this.resize)
    addEventListener('pointermove', this.onPointer, { passive: true })
    document.addEventListener('visibilitychange', this.onVis)
    this.loop()
  }

  private buildLocal() {
    const pr = this.pr, small = this.small, v = this.v, L = this.site

    // céu do lugar: poeira e uma faixa de estrelas
    const sky = cloud()
    for (let i = 0; i < (small ? 600 : 1400); i++) {
      v.randomDirection(); v.y = Math.abs(v.y) * 0.9 + 0.05
      v.normalize().multiplyScalar(900)
      push(sky, v.x, v.y, v.z, Math.random() > 0.85 ? '#f5a524' : '#cdeef5', 1.2 + Math.random() * 2.2)
    }
    const band = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0.4, 0.95))
    for (let i = 0; i < (small ? 3500 : 9000); i++) {
      const a = Math.random() * Math.PI * 2, spread = (Math.random() + Math.random() + Math.random() - 1.5) * 0.16
      v.set(Math.cos(a), spread, Math.sin(a)).normalize().applyQuaternion(band)
      if (v.y < 0.02) continue
      v.multiplyScalar(880)
      push(sky, v.x, v.y, v.z, Math.random() > 0.7 ? '#8fd3e8' : '#2a9fbd', 0.6 + Math.random() * 0.9)
    }
    this.sky = this.addLocal(sky, { pr, size: 0.9, far: 3000, twinkle: 0.6, opacity: 0 }, L)

    // mar: malha polar, densa perto da plataforma e rala no horizonte
    const sea = cloud()
    for (let r = 1.2; r < 230; r += 0.42 + r * (small ? 0.022 : 0.011)) {
      const n = Math.floor((2 * Math.PI * r) / (0.42 + r * (small ? 0.022 : 0.011)))
      const off = Math.random() * 6.28
      for (let i = 0; i < n; i++) {
        const a = off + (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.02
        push(sea, Math.cos(a) * r, 0, Math.sin(a) * r, '#1b6ba3', 1)
      }
    }
    this.ocean = this.addLocal(sea, { pr, size: 0.6, far: 260, waves: true, twinkle: 0.1, opacity: 0 }, L)
    this.ocean.material.uniforms.uGlow.value.copy(FLARE).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.55)

    // a indústria no centro, com luz contida para não estourar os detalhes
    const rig = new THREE.Group()
    rig.rotation.y = -0.55
    L.add(rig)
    this.rigPts.push(this.addLocal(platform(small ? 0.9 : 1.6), { pr, size: 0.62, far: 400, twinkle: 0.1, opacity: 0 }, rig))
    this.rigPts.push(this.addLocal(flame(small ? 200 : 360), { pr, size: 0.55, far: 400, flare: true, twinkle: 0, opacity: 0 }, rig))
    const glow = cloud()
    for (let i = 0; i < 50; i++) { v.randomDirection().multiplyScalar(Math.random() * 1.8); push(glow, FLARE.x + v.x, FLARE.y + 0.8 + v.y, FLARE.z + v.z, '#e0622a', 2 + Math.random() * 2) }
    this.rigPts.push(this.addLocal(glow, { pr, size: 0.45, far: 400, twinkle: 0.6, opacity: 0 }, rig))

    // órbita do ambiente
    const ringA = cloud(), ringB = cloud()
    const na = small ? 320 : 720, nb = small ? 280 : 620
    for (let i = 0; i < na; i++) { const a = (i / na) * Math.PI * 2; push(ringA, Math.cos(a) * R_IN, 0, Math.sin(a) * R_IN, '#8fd3e8', 1.3, (i / na) * 2) }
    for (let i = 0; i < nb; i++) { const a = (i / nb) * Math.PI * 2; push(ringB, Math.cos(a) * R_OUT, 0, Math.sin(a) * R_OUT, '#2a9fbd', 1, 1 - i / nb) }
    this.ringPts.push(this.addLocal(ringA, { pr, size: 0.65, far: 400, twinkle: 0.2, opacity: 0, trail: { speed: 0.05, pow: 3 } }, this.orbit))
    this.ringPts.push(this.addLocal(ringB, { pr, size: 0.65, far: 400, twinkle: 0.2, opacity: 0, trail: { speed: 0.03, pow: 2 } }, this.orbit))
    ORBIT.forEach((o, i) => {
      const holder = new THREE.Group()
      const pts = this.addLocal(o.make(), { pr, size: 0.68, far: 400, flap: o.flap, twinkle: 0.12, opacity: 0 }, holder)
      pts.scale.setScalar(o.scale)
      this.orbit.add(holder)
      this.orbiters.push({ id: o.id, o: holder, pts, a0: (i / ORBIT.length) * Math.PI * 2 + 0.4, y: o.y ?? 0 })
    })
    this.orbit.position.y = ORBIT_Y
    this.orbit.rotation.set(0.3, 0, -0.07)
    L.add(this.orbit)

    // linhas de luz da indústria até cada elemento em órbita (coordenadas locais, atualizadas a cada quadro)
    const links = cloud()
    ORBIT.forEach((_, j) => { for (let i = 0; i < LINK_N; i++) push(links, 0, 0, 0, '#f5a524', 1, i / LINK_N - j * 0.21) })
    this.links = this.addLocal(links, { pr, size: 0.52, far: 400, twinkle: 0, opacity: 0, trail: { speed: 0.45, pow: 6 } }, L)

    // a coluna de perfuração sai do centro da plataforma e desce com a rolagem da página
    this.pipePts = this.addLocal(drillPipe(small), { pr, size: 0.5, far: 160, twinkle: 0.08, opacity: 0, cut: true }, this.pipe)
    L.add(this.pipe)
    this.rigPts.push(this.pipePts)
    this.rigPts.push(this.addLocal(riser(small), { pr, size: 0.45, far: 140, twinkle: 0.2, opacity: 0 }, L))
    this.addLocal(bop(), { pr, size: 0.55, far: 120, twinkle: 0.1 }, L)
    this.addLocal(bit(), { pr, size: 0.36, far: 120, twinkle: 0.05 }, this.bitGroup)
    this.cut = this.addLocal(cuttings(small ? 260 : 520), { pr, size: 0.4, far: 120, twinkle: 0, flare: true, opacity: 0 }, this.bitGroup)
    L.add(this.bitGroup)
    this.addLocal(seabed(small), { pr, size: 0.6, far: 120, twinkle: 0.1 }, L)
    this.rock = this.addLocal(strata(small), { pr, size: 1, far: 120, twinkle: 0.06, hole: true }, L)
    this.water = this.addLocal(waterColumn(small), { pr, size: 0.6, far: 110, twinkle: 0.5, opacity: 0 }, L)
    this.rays = this.addLocal(lightRays(small), { pr, size: 0.6, far: 140, twinkle: 0.3, opacity: 0 }, L)
    // cardumes em duas profundidades
    for (const [y, x] of [[-70, -26], [-175, -34]]) {
      const g = new THREE.Group()
      const f = this.addLocal(fishSchool(), { pr, size: 0.55, far: 120, twinkle: 0.2 }, g)
      f.scale.setScalar(3.2)
      g.position.set(x, y, -12)
      L.add(g)
      this.fish.push(g)
    }
  }

  /** Profundidade local da ponta da broca para uma posição da rolagem. */
  private tipAt(d: number) {
    const top = -16, bed = SEABED + 2
    return d < 0.93 ? top + (bed - top) * (d / 0.93) : bed + (BOTTOM - bed) * ((d - 0.93) / 0.07)
  }

  /** Começa o voo (ou pula direto para o fim, com movimento reduzido). */
  play() {
    if (this.reduced) { this.flightK = 1; this.finish(); this.render(6); return }
    this.playing = true
    this.flightT0 = performance.now()
  }
  /** Acelera até o fim do voo. */
  skip() {
    if (!this.playing || this.skipFrom >= 0) return
    this.skipFrom = this.flightK
    this.skipT0 = performance.now()
  }
  private finish() {
    this.playing = false
    this.doneAt = performance.now()
    this.onFinish?.()
  }

  private onPointer = (e: PointerEvent) => this.mouse.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1)
  private onVis = () => {
    cancelAnimationFrame(this.raf)
    if (!document.hidden) this.loop()
  }
  setVisible(v: boolean) {
    if (v === this.visible) return
    this.visible = v
    cancelAnimationFrame(this.raf)
    if (v) this.loop()
  }

  private resize = () => {
    this.w = this.canvas.clientWidth || innerWidth
    this.h = this.canvas.clientHeight || innerHeight
    this.narrow = this.w / this.h < 0.9
    this.renderer.setSize(this.w, this.h, false)
    this.camera.aspect = this.w / this.h
    this.camera.updateProjectionMatrix()
    this.fx.resize(this.w, this.h)
    if (this.reduced) this.render(6)
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    if (!this.visible) return
    this.render((performance.now() - this.t0) / 1000)
  }

  private tmp = new THREE.Vector3()

  private render(t: number) {
    const cam = this.camera, now = performance.now()
    // posição no voo
    if (this.playing) {
      let k = ((now - this.flightT0) / FLIGHT_MS) * this.speed
      if (this.skipFrom >= 0) k = this.skipFrom + (1 - this.skipFrom) * easeOut(Math.min(1, (now - this.skipT0) / 1100))
      this.flightK = Math.min(1, k)
      if (this.flightK >= 1) this.finish()
    }
    const k = this.flightK
    const settle = this.doneAt < 0 ? 0 : smooth(0, 1800, now - this.doneAt) // entrada suave do movimento livre do hero

    // a cena fica à direita do texto no desktop e embaixo dele no celular (entra no fim da descida)
    const shift = smooth(0.78, 1, k)
    this.diveS += (this.dive * settle - this.diveS) * (this.reduced ? 1 : 0.08)
    const dk = ease(this.diveS)
    this.descentS += (this.descent * settle - this.descentS) * (this.reduced ? 1 : 0.1)
    const tip = this.tipAt(this.descentS)
    // na descida a coluna fica no terço direito; o conteúdo ocupa o resto da tela
    this.sideS += (this.side - this.sideS) * (this.reduced ? 1 : 0.045) // a coluna desliza para o lado livre
    const deepX = (this.narrow ? 0.405 : 0.29) * this.sideS
    const dx = (this.narrow ? 0 : 0.2 * this.w) * shift * (1 - dk) + deepX * this.w * dk
    const dy = (this.narrow ? 0.22 * this.h : 0.14 * this.h) * shift * (1 - dk)
    cam.setViewOffset(this.w, this.h, -dx, -dy, this.w, this.h)
    const globeFov = this.narrow ? 60 : 40, heroFov = this.narrow ? 58 : 40
    cam.fov = globeFov + (heroFov - globeFov) * shift
    cam.updateProjectionMatrix()

    this.site.updateMatrixWorld()
    const M = this.site.matrixWorld
    if (k < SPLIT) {
      // do espaço ao mapa da margem, e do mapa até o alto da plataforma
      const a = ease(smooth(0, 0.22, k)), zIn = ease(smooth(0.13, 0.3, k)), m = ease(smooth(0.44, SPLIT, k))
      const start = dir(24, -82, this.tmp)
      const d = start.clone().lerp(dir(MAP_CENTER.lat, MAP_CENTER.lon), a).normalize().lerp(this.siteDir, m).normalize()
      const far = R * (this.narrow ? 4.2 : 3.3), mapAlt = this.narrow ? 330 : 150
      let dist = far + (R + mapAlt - far) * Math.pow(zIn, 0.8)
      dist -= 12 * smooth(0.3, 0.44, k) * (1 - m) // deriva lenta enquanto o mapa está na tela
      dist += (64 - mapAlt + 12 * (1 - m)) * m
      cam.position.copy(d).multiplyScalar(dist)
      cam.up.set(0, 1, 0)
      cam.lookAt(d.clone().multiplyScalar(R * smooth(0.08, 0.3, k)))
    } else {
      // a descida e, depois, a pose da tela inicial com parallax e mergulho pela rolagem
      const u = smooth(SPLIT, 1, k)
      const p = this.camPath.getPoint(u), l = this.lookPath.getPoint(u)
      const upL = new THREE.Vector3(0, 0, -1).lerp(new THREE.Vector3(0, 1, 0), smooth(0, 0.35, u)).normalize()
      if (settle > 0) {
        const D = this.narrow ? 92 : 70
        this.look.lerp(this.mouse, 0.04)
        const yaw = (this.look.x * 0.14 + (this.reduced ? 0 : Math.sin(t * 0.07) * 0.06)) * settle
        const hero = new THREE.Vector3(Math.sin(yaw) * D, 17 - this.look.y * 1.5 * settle, Math.cos(yaw) * D)
        const sway = this.reduced ? 0 : Math.sin(t * 0.2) * 1.5 + this.look.x * 2
        // dentro da rocha a câmera fica um pouco acima da broca, para mostrar as camadas da formação
        const rockK = smooth(0, 48, SEABED + 2 - tip)
        const lift = 6 * rockK
        const deep = new THREE.Vector3(sway, tip + 4.5 + lift, (this.narrow ? 52 : 26) + 14 * rockK)
        p.copy(hero).lerp(deep, dk)
        l.set(0, 9, 0).lerp(new THREE.Vector3(0, tip + 3 + lift, 0), dk)
      }
      cam.position.copy(p).applyMatrix4(M)
      cam.up.copy(upL.transformDirection(M))
      cam.lookAt(l.applyMatrix4(M))
    }

    // camadas: o planeta dá lugar à margem, que dá lugar ao lugar da plataforma
    const alt = cam.position.length() - R
    const shrink = 0.18 + 0.82 * smooth(2, R * 0.6, alt)
    this.planet.forEach((p, i) => {
      p.material.uniforms.uOpacity.value = 1 - 0.8 * smooth(0.16, 0.3, k) - 0.2 * smooth(0.52, 0.6, k)
      p.material.uniforms.uSize.value = this.planetSize[i] * shrink
    })
    this.halo.material.uniforms.uOpacity.value = 1 - smooth(0.14, 0.26, k)
    this.sats.material.uniforms.uOpacity.value = 1 - smooth(0.1, 0.22, k)
    this.stars.material.uniforms.uOpacity.value = 1 - smooth(0.58, 0.78, k)
    const near = 1 - smooth(R * 1.0, R * 1.4, alt) // o mapa aparece já da altitude do mapa (maior no celular)
    const siteDist = cam.position.distanceTo(this.tmp.copy(this.siteDir).multiplyScalar(R))
    const rShrink = Math.max(0.03, Math.min(1, siteDist / 70))
    this.region.forEach((p, i) => {
      p.material.uniforms.uOpacity.value = near * (1 - smooth(0.7, 0.86, k))
      p.material.uniforms.uSize.value = this.regionSize[i] * (k < SPLIT ? Math.max(1, (alt / 150) * 0.55) : rShrink)
    })

    const localY = this.tmp.copy(cam.position).applyMatrix4(M.clone().invert()).y
    const water = this.tide * 0.35
    const under = smooth(0.5, -1.5, localY - water)
    const ou = this.ocean.material.uniforms
    ou.uTide.value = water
    ou.uOpacity.value = smooth(0.6, 0.84, k) * (1 - under * 0.45)
    const rigOp = smooth(0.54, 0.7, k)
    this.rigPts.forEach(p => { p.material.uniforms.uOpacity.value = rigOp })
    this.sky.material.uniforms.uOpacity.value = smooth(0.68, 0.92, k)
    this.ringPts.forEach(p => { p.material.uniforms.uOpacity.value = smooth(0.82, 0.95, k) })
    this.orbiters.forEach((o, i) => { o.pts.material.uniforms.uOpacity.value = smooth(0.86 + i * 0.022, 0.94 + i * 0.012, k) })
    this.links.material.uniforms.uOpacity.value = smooth(0.96, 1, k) * (1 - smooth(0.05, 0.25, dk))
    this.water.material.uniforms.uOpacity.value = under
    this.rays.material.uniforms.uOpacity.value = under * (1 - smooth(-30, -110, tip))
    this.pipePts.material.uniforms.uCut.value = tip + 4.6
    this.rock.material.uniforms.uCut.value = tip
    this.bitGroup.position.y = tip
    this.cut.material.uniforms.uOpacity.value = smooth(SEABED + 1, SEABED - 3, tip)
    if (!this.reduced) {
      this.pipe.rotation.y = t * 1.6
      this.bitGroup.rotation.y = t * 1.6
      this.fish.forEach((g, i) => { g.rotation.y = t * (0.12 + i * 0.05) })
    }
    // brilho forte só no espaço; perto da plataforma ele é contido para preservar os detalhes
    // debaixo d'água não há detalhe fino a preservar: o brilho volta a subir
    this.fx.pass.strength = 0.75 - 0.3 * smooth(0.5, 0.75, k) + under * 0.3
    this.fx.pass.threshold = 0.18 + 0.12 * smooth(0.5, 0.75, k) - under * 0.14

    // órbita
    const spin = this.reduced ? 0 : t * 0.045
    this.orbiters.forEach(o => {
      const a = o.a0 + spin
      o.o.position.set(Math.cos(a) * R_IN, o.y + Math.sin(t * 0.8 + o.a0) * 0.4, Math.sin(a) * R_IN)
      o.o.rotation.y = -a + Math.PI
    })
    this.orbit.rotation.y = this.reduced ? 0 : Math.sin(t * 0.05) * 0.1
    this.orbit.updateMatrixWorld(true)

    // linhas: da torre até cada elemento, num arco suave por cima (em coordenadas locais)
    const pos = this.links.geometry.attributes.position as THREE.BufferAttribute
    const hub = new THREE.Vector3(0, 9, 0), end = new THREE.Vector3(), mid = new THREE.Vector3()
    const inv = M.clone().invert()
    this.orbiters.forEach((o, j) => {
      o.o.getWorldPosition(end).applyMatrix4(inv)
      mid.copy(hub).add(end).multiplyScalar(0.5); mid.y += 6
      for (let i = 0; i < LINK_N; i++) {
        const s = i / (LINK_N - 1), a = (1 - s) * (1 - s), b = 2 * (1 - s) * s, c = s * s
        pos.setXYZ(j * LINK_N + i, hub.x * a + mid.x * b + end.x * c, hub.y * a + mid.y * b + end.y * c, hub.z * a + mid.z * b + end.z * c)
      }
    })
    pos.needsUpdate = true

    this.scene.traverse(o => {
      const u = ((o as P).material as THREE.ShaderMaterial | undefined)?.uniforms?.uOpacity
      if (u) o.visible = u.value > 0.002
    })
    setTime(this.scene, t)
    this.fx.composer.render()

    if (this.onLabels) {
      const out: Label[] = []
      const show = this.doneAt >= 0 && dk < 0.12
      const proj = (id: string, p: THREE.Vector3) => {
        p.project(cam)
        out.push({ id, x: (p.x * 0.5 + 0.5) * this.w, y: (-p.y * 0.5 + 0.5) * this.h, show: show && p.z < 1 })
      }
      // topo da torre (deslocada e girada dentro do equipamento)
      proj('industria', new THREE.Vector3(1.5, 25, -2).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.55).applyMatrix4(M))
      this.orbiters.forEach(o => { o.o.getWorldPosition(this.v); this.v.add(this.tmp.copy(this.siteDir).multiplyScalar(5.5 * S)); proj(o.id, this.v.clone()) })
      // rótulos do mapa: o Pará, a sede e as cinco bacias, enquanto o mapa está na tela
      const mapA = smooth(0.27, 0.32, k) * (1 - smooth(0.5, 0.56, k))
      const mapLabel = (id: string, p: THREE.Vector3) => {
        const q = p.clone().project(cam)
        out.push({ id, x: (q.x * 0.5 + 0.5) * this.w, y: (-q.y * 0.5 + 0.5) * this.h, show: mapA > 0.01 && q.z < 1, alpha: mapA })
      }
      this.mapPts.basins.forEach((p, i) => mapLabel('bacia-' + i, p))
      mapLabel('para', this.mapPts.para)
      mapLabel('sede', this.mapPts.sede)
      const b = new THREE.Vector3(0, tip, 0).applyMatrix4(M).project(cam)
      out.push({ id: 'broca', x: (b.x * 0.5 + 0.5) * this.w, y: (-b.y * 0.5 + 0.5) * this.h, show: dk > 0.85, depth: tip })
      this.onLabels(out)
    }
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    removeEventListener('resize', this.resize)
    removeEventListener('pointermove', this.onPointer)
    document.removeEventListener('visibilitychange', this.onVis)
    disposeAll(this.scene)
    this.fx.dispose()
    this.renderer.dispose()
  }
}
