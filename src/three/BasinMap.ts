import * as THREE from 'three'
import { basinCenter, buildTerrain, SEDE } from './terrain'
import { coastLine, terrainPoints } from './points'

/** A margem inteira em nuvem de pontos; a bacia escolhida sobe e acende. Arrastar gira a vista. */
export class BasinMap {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(38, 1, 0.1, 500)
  private pts: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
  private ring: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
  private raf = 0
  private t0 = performance.now()
  private target = new THREE.Vector3()
  private focus = new THREE.Vector3()
  private yaw = 0
  private yawV = 0
  private drag: { x: number; yaw: number } | null = null
  private sel = 0
  private selT = 0
  private visible = false
  onProject?: (x: number, y: number, slx: number, sly: number) => void

  constructor(private canvas: HTMLCanvasElement, private reduced: boolean) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    const pr = Math.min(devicePixelRatio || 1, 1.75)
    this.renderer.setPixelRatio(pr)
    const terrain = buildTerrain(innerWidth < 700 ? 4.6 : 3.2)
    this.pts = terrainPoints(terrain, pr)
    this.pts.material.uniforms.uSweep.value = 999
    this.pts.material.uniforms.uSize.value = innerWidth < 700 ? 2.2 : 1.9
    this.scene.add(this.pts)
    this.scene.add(coastLine(terrain, '#f2f9fb', 0.55))

    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.8, 48), new THREE.MeshBasicMaterial({ color: '#d33a2c', side: THREE.DoubleSide, transparent: true }))
    this.ring.rotation.x = -Math.PI / 2
    this.ring.position.set(SEDE[0], 0.25, SEDE[2])
    this.scene.add(this.ring)
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.32, 24), new THREE.MeshBasicMaterial({ color: '#d33a2c', side: THREE.DoubleSide }))
    dot.rotation.x = -Math.PI / 2
    dot.position.copy(this.ring.position)
    this.scene.add(dot)

    this.select(0, true)
    this.resize()
    addEventListener('resize', this.resize)
    canvas.addEventListener('pointerdown', this.down)
    addEventListener('pointermove', this.move)
    addEventListener('pointerup', this.up)
  }

  private down = (e: PointerEvent) => { this.drag = { x: e.clientX, yaw: this.yaw }; this.canvas.setPointerCapture(e.pointerId) }
  private move = (e: PointerEvent) => {
    if (!this.drag) return
    const ny = this.drag.yaw + (e.clientX - this.drag.x) * 0.004
    this.yawV = ny - this.yaw
    this.yaw = Math.max(-0.7, Math.min(0.7, ny))
    if (this.reduced) this.frame()
  }
  private up = () => { this.drag = null }

  select(i: number, instant = false) {
    this.sel = i
    const [x, y, z] = basinCenter(i)
    this.target.set(x, y, z)
    if (instant || this.reduced) { this.focus.copy(this.target); this.selT = 1 }
    else this.selT = 0
    this.pts.material.uniforms.uSel.value = i
    if (this.reduced) this.frame()
  }

  setVisible(v: boolean) {
    if (v === this.visible) return
    this.visible = v
    cancelAnimationFrame(this.raf)
    if (v) { if (this.reduced) this.frame(); else this.loop() }
  }

  private resize = () => {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.fov = w / h < 0.9 ? 52 : 36
    this.camera.updateProjectionMatrix()
    if (this.reduced) this.frame()
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    this.frame()
  }

  private frame() {
    const t = this.reduced ? 2 : (performance.now() - this.t0) / 1000
    if (!this.drag && !this.reduced) { this.yaw += this.yawV; this.yawV *= 0.92; this.yaw += (Math.sin(t * 0.15) * 0.18 - this.yaw) * 0.004 }
    this.focus.lerp(this.target, this.reduced ? 1 : 0.05)
    this.selT = Math.min(1, this.selT + 0.03)
    const u = this.pts.material.uniforms
    u.uTime.value = t
    u.uSelT.value = 1 - Math.pow(1 - this.selT, 3)

    const f = this.focus
    const dist = this.camera.aspect < 0.9 ? 52 : 34
    this.camera.position.set(f.x * 0.6 + Math.sin(this.yaw) * dist, 24, f.z + Math.cos(this.yaw) * dist + 6)
    this.camera.lookAt(f.x * 0.75, -3, f.z - 2)

    const k = (t * 0.7) % 1
    this.ring.scale.setScalar(1 + k * 2.2)
    this.ring.material.opacity = 1 - k

    if (this.onProject) {
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight
      const p = this.target.clone().setY(this.target.y + 1.2).project(this.camera)
      const s = new THREE.Vector3(...SEDE).project(this.camera)
      this.onProject((p.x * 0.5 + 0.5) * w, (-p.y * 0.5 + 0.5) * h, (s.x * 0.5 + 0.5) * w, (-s.y * 0.5 + 0.5) * h)
    }
    this.renderer.render(this.scene, this.camera)
  }

  get selected() { return this.sel }

  dispose() {
    cancelAnimationFrame(this.raf)
    removeEventListener('resize', this.resize)
    this.canvas.removeEventListener('pointerdown', this.down)
    removeEventListener('pointermove', this.move)
    removeEventListener('pointerup', this.up)
    this.scene.traverse(o => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      const mat = m.material as THREE.Material | undefined
      mat?.dispose?.()
    })
    this.renderer.dispose()
  }
}
