import {
  ACESFilmicToneMapping,
  Clock,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector2,
  WebGLRenderer,
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { gsap } from 'gsap'
import { buildWorld } from './world'
import { buildPacket } from './packet'
import { buildWords } from './words'
import { createRig } from './camera-path'
import { scrollState } from '../scroll/state'

const INK = 0x0d0806

export async function initScene(canvas: HTMLCanvasElement) {
  const coarse = matchMedia('(pointer: coarse)').matches
  const small = Math.min(innerWidth, innerHeight) < 760 || coarse

  const renderer = new WebGLRenderer({ canvas, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75))
  renderer.setSize(innerWidth, innerHeight)
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  const scene = new Scene()
  scene.background = new Color(INK)
  scene.fog = new Fog(INK, 16, 78)

  const camera = new PerspectiveCamera(small ? 60 : 52, innerWidth / innerHeight, 0.1, 260)

  // warm key + faint ember rim — the packet's point light does the rest
  scene.add(new HemisphereLight(0x4a3018, 0x0d0806, 0.85))
  const key = new DirectionalLight(0xffb066, 1.5)
  key.position.set(7, 14, 6)
  scene.add(key)
  const rim = new DirectionalLight(0xe6500a, 0.55)
  rim.position.set(-8, 3, -10)
  scene.add(rim)

  const world = buildWorld(small ? 0.55 : 1)
  scene.add(world.group)

  const packet = buildPacket()
  scene.add(packet.group, packet.trail)

  const words = buildWords()
  scene.add(words.group)

  const rig = createRig()

  // filmic finish: bloom sells every emissive surface
  const composer = new EffectComposer(renderer)
  composer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75))
  composer.setSize(innerWidth, innerHeight)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(
    new UnrealBloomPass(new Vector2(innerWidth, innerHeight), small ? 0.5 : 0.62, 0.85, 0.5),
  )
  composer.addPass(new OutputPass())

  // pointer parallax (skipped on touch)
  const parallax = { x: 0, y: 0 }
  const target = { x: 0, y: 0 }
  if (!coarse) {
    addEventListener('pointermove', (e) => {
      target.x = (e.clientX / innerWidth - 0.5) * 2
      target.y = -(e.clientY / innerHeight - 0.5) * 2
    })
  }

  let film = 0
  let finale = 0
  const clock = new Clock()
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime()
    film += (scrollState.film - film) * 0.075
    finale += (scrollState.finale - finale) * 0.075
    parallax.x += (target.x - parallax.x) * 0.04
    parallax.y += (target.y - parallax.y) * 0.04

    rig.update(camera, film, finale, t, parallax)
    world.update(t)
    packet.update(film, finale, t)
    words.update(film)
    composer.render()
  })

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight)
    composer.setSize(innerWidth, innerHeight)
  })

  gsap.to(canvas, { opacity: 1, duration: 1.8, ease: 'power2.out', delay: 0.2 })
}
