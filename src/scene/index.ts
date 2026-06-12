import { Clock, PerspectiveCamera, Scene } from 'three'
import { WebGPURenderer } from 'three/webgpu'
import { gsap } from 'gsap'
import { buildConstellation } from './constellation'
import { createRig } from './camera-path'
import { initInteraction } from './interaction'
import { scrollState } from '../scroll/state'

export async function initScene(canvas: HTMLCanvasElement) {
  const coarse = matchMedia('(pointer: coarse)').matches
  const small = Math.min(innerWidth, innerHeight) < 760 || coarse
  // ?gl=1 forces the WebGL2 backend for testing the fallback path
  const forceWebGL = new URLSearchParams(location.search).has('gl')

  const renderer = new WebGPURenderer({ canvas, antialias: true, alpha: true, forceWebGL })
  await renderer.init()
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2))
  renderer.setSize(innerWidth, innerHeight)

  const scene = new Scene()
  const camera = new PerspectiveCamera(small ? 58 : 50, innerWidth / innerHeight, 0.1, 220)

  const { objects, nodes, uniforms } = buildConstellation({
    mul: small ? 0.55 : 1,
    stars: small ? 180 : 380,
  })
  scene.add(...objects)

  const rig = createRig()
  const interaction = initInteraction({ camera, nodes, uniforms, coarse })

  let smoothP = 0
  const clock = new Clock()
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime()
    uniforms.uTime.value = t
    smoothP += (scrollState.progress - smoothP) * 0.08
    uniforms.uActive.value = Math.min(4, scrollState.chapters * 5 - 0.5)
    rig.update(camera, smoothP, t, interaction.parallax)
    interaction.update(t)
    renderer.render(scene, camera)
  })

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight)
  })

  gsap.to(canvas, { opacity: 1, duration: 1.6, ease: 'power2.out', delay: 0.2 })
}
