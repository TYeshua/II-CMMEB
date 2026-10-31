import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

/*
  Acabamento da imagem, como uma lente: brilho só nas fontes de luz de verdade (limiar alto),
  um "ombro" que comprime os realces em vez de estourar áreas densas em branco,
  e um grão temporal leve que tira o aspecto de computador dos pontos.
  A saída não converte espaço de cor: as cores dos shaders já são escritas como devem aparecer.
*/
const Finish = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: 0.035 }, uRes: { value: new THREE.Vector2(1, 1) } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uTime, uGrain; uniform vec2 uRes; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    vec3 shoulder(vec3 c){
      // linear até 0.72; acima disso, aproxima-se de 1 sem cortar (mantém o matiz das áreas densas)
      vec3 k = max(c - 0.72, 0.0);
      return min(c, 0.72) + 0.28 * (1.0 - exp(-k / 0.28));
    }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      c = clamp(c, 0.0, 64.0); // um NaN ou infinito de um só ponto não pode tomar a tela
      c = shoulder(c);
      float g = h(floor(vUv * uRes) + fract(uTime * 7.31) * 91.7) - 0.5;
      c += g * uGrain * (0.35 + 0.65 * (1.0 - dot(c, vec3(0.299, 0.587, 0.114))));
      gl_FragColor = vec4(c, 1.0);
    }`,
}

export function bloom(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, o: { strength: number; radius: number; threshold: number }) {
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const pass = new UnrealBloomPass(new THREE.Vector2(256, 256), o.strength, o.radius, o.threshold)
  composer.addPass(pass)
  const finish = new ShaderPass(Finish)
  composer.addPass(finish)
  const resize = (w: number, h: number) => {
    composer.setPixelRatio(renderer.getPixelRatio())
    composer.setSize(w, h)
    pass.resolution.set(w / 2, h / 2) // meia resolução: brilho barato
    finish.uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio())
  }
  return { composer, pass, finish, resize, dispose: () => composer.dispose() }
}
