import * as THREE from 'three'

/*
  Pontilhismo como levantamento: cada forma é uma nuvem de amostras, como um sonar multifeixe
  ou uma sísmica vê o fundo. Os pontos são discos nítidos (borda de 1 px), de tamanho estável
  e limitado, e não piscam: a vida da cena vem de luz com causa (o pulso do sonar, a chama).
  Um único shader cobre os casos especiais por #define:
  WAVES  grade de pontos deslocada por ondas Gerstner (oceano)
  FLAP   pontos com aFlap sobem e descem (asas)
  FLARE  pontos sobem, encolhem e somem em ciclo (chama)
  TRAIL  pulso que corre ao longo de uma linha (aFlap = posição na linha)
  CUT    a coluna só existe acima da broca · HOLE o furo aberto na rocha
  SNOW   neve marinha: partículas que descem devagar pela coluna d'água
  REVEAL os pontos só existem dentro do raio do pulso (uPing.w); a borda do pulso acende
*/

export type Cloud = { pos: number[]; col: number[]; size: number[]; seed: number[]; flap: number[] }
export const cloud = (): Cloud => ({ pos: [], col: [], size: [], seed: [], flap: [] })

const tmp = new THREE.Color()
export function push(c: Cloud, x: number, y: number, z: number, color: string | THREE.Color, size = 1, flap = 0) {
  const k = typeof color === 'string' ? tmp.set(color) : color
  c.pos.push(x, y, z)
  c.col.push(k.r, k.g, k.b)
  c.size.push(size)
  c.seed.push(Math.random())
  c.flap.push(flap)
}

export function cloudGeometry(c: Cloud) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(c.pos, 3))
  g.setAttribute('aColor', new THREE.Float32BufferAttribute(c.col, 3))
  g.setAttribute('aSize', new THREE.Float32BufferAttribute(c.size, 1))
  g.setAttribute('aSeed', new THREE.Float32BufferAttribute(c.seed, 1))
  g.setAttribute('aFlap', new THREE.Float32BufferAttribute(c.flap, 1))
  return g
}

export type DotOpts = {
  pr: number; size?: number; far?: number; opacity?: number; maxPx?: number
  waves?: boolean; flap?: boolean; flare?: boolean; twinkle?: number; trail?: { speed: number; pow: number }
  cut?: boolean; hole?: boolean; snow?: boolean; reveal?: boolean
}

export function dotMaterial(o: DotOpts) {
  const defines: Record<string, string> = {}
  if (o.waves) defines.WAVES = ''
  if (o.flap) defines.FLAP = ''
  if (o.flare) defines.FLARE = ''
  if (o.trail) defines.TRAIL = ''
  if (o.cut) defines.CUT = ''
  if (o.hole) defines.HOLE = ''
  if (o.snow) defines.SNOW = ''
  if (o.reveal) defines.REVEAL = ''
  return new THREE.ShaderMaterial({
    defines,
    transparent: true,
    depthWrite: false,
    depthTest: false, // pontos somam luz: a ordem não importa e não há profundidade a testar
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPix: { value: o.pr },
      uSize: { value: o.size ?? 1 },
      uMaxPx: { value: (o.maxPx ?? 7) * o.pr },
      uFar: { value: o.far ?? 400 },
      uOpacity: { value: o.opacity ?? 1 },
      // "respiração" lenta e pequena; o piscar aleatório de antes virava ruído
      uTwinkle: { value: (o.twinkle ?? 0) * 0.3 },
      uTide: { value: 0 },
      uWS: { value: 1 }, // escala das ondas
      uLow: { value: new THREE.Color('#1b6ba3') },
      uHigh: { value: new THREE.Color('#8fd3e8') },
      uGlow: { value: new THREE.Vector3(0, 0, 9999) }, // reflexo da chama sobre as cristas (posição local)
      uSpeed: { value: o.trail?.speed ?? 0 },
      uPow: { value: o.trail?.pow ?? 4 },
      uCut: { value: -1e9 }, // y local da ponta da broca
      // pulso de sonar: centro (xyz, no espaço do objeto) e raio (w); largura da frente; força
      uPing: { value: new THREE.Vector4(0, 0, 0, -1) },
      uPingW: { value: 1 },
      uPingK: { value: 0 },
      uPingCol: { value: new THREE.Color('#ffd27a') },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor; attribute float aSize; attribute float aSeed; attribute float aFlap;
      uniform float uTime, uPix, uSize, uMaxPx, uFar, uOpacity, uTwinkle, uTide, uWS;
      uniform vec3 uLow, uHigh, uGlow, uPingCol;
      uniform float uSpeed, uPow, uCut, uPingW, uPingK;
      uniform vec4 uPing;
      varying vec3 vC; varying float vA; varying float vS;
      #ifdef WAVES
      vec3 gerstner(vec4 w, vec3 p){
        float k = 6.28318 / w.w; float c = sqrt(9.8 / k); vec2 d = normalize(w.xy);
        float f = k * (dot(d, p.xz) - c * uTime); float a = w.z / k;
        return vec3(d.x * a * cos(f), a * sin(f), d.y * a * cos(f));
      }
      #endif
      void main(){
        vec3 p = position;
        vec3 col = aColor;
        float a = 1.0;
        #ifdef SNOW
          // desce devagar e volta ao topo da coluna (de -2 a -296)
          p.y = -2.0 - mod(-position.y - 2.0 + uTime * (0.6 + aSeed * 0.8), 294.0);
          p.x += sin(uTime * 0.3 + aSeed * 30.0) * 0.6;
        #endif
        #ifdef WAVES
          vec3 q = p / uWS;
          vec3 d = gerstner(vec4(1.0, 0.55, 0.2, 34.0), q) + gerstner(vec4(-0.35, 1.0, 0.16, 19.0), q)
                 + gerstner(vec4(0.75, -0.35, 0.12, 10.5), q) + gerstner(vec4(-0.15, -0.9, 0.08, 6.2), q);
          p += d * uWS;
          p.y += uTide;
          float crest = clamp(d.y * 0.55 + 0.45, 0.0, 1.0);
          col = mix(uLow, uHigh, crest * crest);
          a = 0.4 + 0.6 * crest;
          vec2 gd = (p.xz - uGlow.xz) / uWS;
          float glint = exp(-dot(gd, gd) * 0.0035) * (0.2 + crest * crest * 1.3);
          col += vec3(1.0, 0.62, 0.28) * glint;
          a = min(1.0, a + glint * 0.5);
        #endif
        #ifdef FLAP
          p.y += sin(uTime * 7.0 + aSeed * 0.6) * aFlap;
        #endif
        #ifdef FLARE
          float t = fract(uTime * 0.9 + aSeed * 7.0);
          p += vec3(sin(aSeed * 91.0) * 0.6 * t, t * 3.4, cos(aSeed * 57.0) * 0.6 * t) * aFlap;
          a *= (1.0 - t);
          col = mix(vec3(1.0, 0.95, 0.75), aColor, t);
        #endif
        #ifdef CUT
          if (position.y < uCut) a = 0.0;
        #endif
        #ifdef HOLE
          if (abs(position.x) < 2.4 && position.y > uCut) a = 0.0;
        #endif
        #ifdef TRAIL
          a *= 0.14 + 0.86 * pow(fract(aFlap - uTime * uSpeed), uPow);
        #endif
        // pulso de sonar: a frente acende os pontos por onde passa e deixa um rastro curto
        float pd = length(position - uPing.xyz) - uPing.w;
        float front = exp(-pd * pd / (uPingW * uPingW)) + 0.35 * exp(min(pd, 0.0) / (uPingW * 3.0)) * step(pd, 0.0);
        col = mix(col, uPingCol, clamp(front * uPingK, 0.0, 0.85));
        a += front * uPingK * 0.6;
        #ifdef REVEAL
          a *= 1.0 - smoothstep(-uPingW * 0.5, uPingW * 0.5, pd);
        #endif
        a *= 1.0 - uTwinkle + uTwinkle * sin(uTime * 0.6 + aSeed * 40.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float dist = -mv.z;
        a *= 1.0 - smoothstep(uFar * 0.5, uFar, dist);
        float s = uSize * aSize * uPix * (130.0 / max(dist, 0.001));
        a *= clamp(s, 0.0, 1.0); // pontos menores que 1 px somem em vez de cintilar
        s *= 1.0 + min(front, 1.0) * uPingK * 0.8; // a frente do pulso engrossa os pontos: lê-se de longe
        s = clamp(s, 1.0, uMaxPx);
        gl_PointSize = s;
        gl_Position = projectionMatrix * mv;
        vC = col; vA = a * uOpacity; vS = s;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vC; varying float vA; varying float vS;
      void main(){
        // disco nítido: borda antisserrilhada de 1 px, sem halo
        float r = length(gl_PointCoord - 0.5) * vS;
        float e = 1.0 - smoothstep(vS * 0.5 - 1.0, vS * 0.5, r);
        e = mix(1.0, e, smoothstep(1.5, 3.0, vS)); // pontos de 1-2 px ficam cheios
        if (e <= 0.0) discard;
        gl_FragColor = vec4(vC, vA * e);
      }`,
  })
}

export function points(c: Cloud, o: DotOpts) {
  return new THREE.Points(cloudGeometry(c), dotMaterial(o))
}

/** Grade de pontos para o mar (use com waves: true). */
export function grid(c: Cloud, size: number, step: number, cx = 0, cz = 0, y = 0, jitter = 0.35) {
  for (let x = -size / 2; x <= size / 2; x += step)
    for (let z = -size / 2; z <= size / 2; z += step)
      push(c, cx + x + (Math.random() - 0.5) * step * jitter, y, cz + z + (Math.random() - 0.5) * step * jitter, '#1b6ba3', 1)
}

/** Anel pontilhado. */
export function ring(c: Cloud, r: number, n: number, color: string, size = 1, y = 0) {
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; push(c, Math.cos(a) * r, y, Math.sin(a) * r, color, size) }
}

export const setTime = (o: THREE.Object3D, t: number) =>
  o.traverse(x => { const m = (x as THREE.Points).material as THREE.ShaderMaterial | undefined; if (m?.uniforms?.uTime) m.uniforms.uTime.value = t })

export function disposeAll(o: THREE.Object3D) {
  o.traverse(x => {
    const m = x as THREE.Mesh
    m.geometry?.dispose()
    const mat = m.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach(k => k.dispose()); else mat?.dispose()
  })
}
