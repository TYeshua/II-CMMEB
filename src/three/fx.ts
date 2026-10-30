import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'

/**
 * Brilho suave nos pontos. A cópia final não converte espaço de cor:
 * as cores dos shaders de pontos já são escritas como devem aparecer.
 */
export function bloom(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, o: { strength: number; radius: number; threshold: number }) {
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const pass = new UnrealBloomPass(new THREE.Vector2(256, 256), o.strength, o.radius, o.threshold)
  composer.addPass(pass)
  composer.addPass(new ShaderPass(CopyShader))
  const resize = (w: number, h: number) => {
    composer.setPixelRatio(renderer.getPixelRatio())
    composer.setSize(w, h)
    pass.resolution.set(w / 2, h / 2) // meia resolução: brilho barato
  }
  return { composer, pass, resize, dispose: () => composer.dispose() }
}
