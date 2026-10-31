import * as THREE from 'three'
import type { TerrainData } from './terrain'

/** Nuvem de pontos do relevo. uSweep revela da esquerda para a direita; uSel destaca uma bacia. */
export function terrainPoints(t: TerrainData, pixelRatio: number) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(t.positions, 3))
  g.setAttribute('aDepth', new THREE.BufferAttribute(t.depth, 1))
  g.setAttribute('aBasin', new THREE.BufferAttribute(t.basin, 1))
  const rnd = new Float32Array(t.count)
  for (let i = 0; i < t.count; i++) rnd[i] = Math.random()
  g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1))

  const m = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSweep: { value: 999 },
      uSel: { value: -1 },
      uSelT: { value: 0 },
      uPix: { value: pixelRatio },
      uSize: { value: 1 },
      uShallow: { value: new THREE.Color('#8fd3e8') },
      uDeep: { value: new THREE.Color('#1b6ba3') },
      uLand: { value: new THREE.Color('#f5a524') },
      uHot: { value: new THREE.Color('#ffd27a') },
      uDim: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute float aDepth; attribute float aBasin; attribute float aRnd;
      uniform float uTime, uSweep, uSel, uSelT, uPix, uSize, uDim;
      uniform vec3 uShallow, uDeep, uLand, uHot;
      varying vec3 vCol; varying float vA; varying float vS;
      void main(){
        vec3 p = position;
        float isSel = (uSel >= 0.0 && abs(aBasin - uSel) < 0.5) ? 1.0 : 0.0;
        float wave = sin(uTime*2.2 + p.x*0.35 + p.z*0.3)*0.5+0.5;
        p.y += isSel * uSelT * (0.25 + 0.35*wave);
        // varredura
        float ahead = p.x - uSweep;
        float seen = 1.0 - smoothstep(-0.2, 0.6, ahead);
        float edge = exp(-ahead*ahead*1.6) * step(-3.0, ahead);
        vec3 sea = mix(uShallow, uDeep, pow(clamp(aDepth,0.0,1.0), 0.6));
        vec3 col = aDepth < 0.0 ? uLand * (0.45 + 0.4*(-aDepth)) : sea;
        col = mix(col, uHot, isSel * uSelT);
        col += vec3(1.0, 0.9, 0.7) * edge * 1.4;
        float a = (aDepth < 0.0 ? 0.6 : 0.55 + 0.45*(1.0-aDepth)) * (seen + edge);
        a *= mix(1.0, (uSel >= 0.0 ? 0.35 : 1.0), (1.0-isSel) * uSelT) * uDim;
        a *= 0.92 + 0.08*sin(uTime*0.6 + aRnd*40.0); // respiração lenta, sem cintilar
        vCol = col; vA = a + isSel*uSelT*0.4;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_Position = projectionMatrix * mv;
        float s = uSize * uPix * (1.0 + edge*1.6 + isSel*uSelT*0.6) * (52.0 / -mv.z);
        gl_PointSize = clamp(s, 1.0, 7.0 * uPix);
        vS = gl_PointSize;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vCol; varying float vA; varying float vS;
      void main(){
        // o mesmo disco nítido das cenas do topo
        float r = length(gl_PointCoord - 0.5) * vS;
        float e = 1.0 - smoothstep(vS * 0.5 - 1.0, vS * 0.5, r);
        e = mix(1.0, e, smoothstep(1.5, 3.0, vS));
        if (e <= 0.0) discard;
        gl_FragColor = vec4(vCol, vA * e);
      }`,
  })
  return new THREE.Points(g, m)
}

export function coastLine(t: TerrainData, color = '#f2f9fb', opacity = 0.7) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(t.coast, 3))
  return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }))
}
