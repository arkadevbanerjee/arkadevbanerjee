// The order itself: a glowing packet that rides a spline through every
// set-piece, carrying its own point light and a fading light trail.
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three'

const FILM_PATH = new CatmullRomCurve3(
  [
    [0, 1.1, 0],
    [1.4, 1.5, -17],
    [0, 2.0, -34], // through the ingress ring
    [-1.2, 1.6, -51],
    [-0.6, 1.5, -68], // down the catalogue aisle
    [1.2, 1.4, -85],
    [0, 1.6, -102], // into the platform gate
    [-0.6, 2.0, -119],
    [0, 2.2, -136], // across the inference field
    [0, 2.6, -153],
    [0, 3.0, -170],
  ].map((p) => new Vector3(...(p as [number, number, number]))),
  false,
  'centripetal',
)

const FINALE_PATH = new CatmullRomCurve3(
  [
    [0, 3.0, -170],
    [0, 9, -190],
    [0.5, 2.2, -209],
    [0.5, 0.6, -211],
  ].map((p) => new Vector3(...(p as [number, number, number]))),
  false,
  'centripetal',
)

function haloTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255, 190, 110, 0.85)')
  g.addColorStop(0.35, 'rgba(255, 150, 50, 0.28)')
  g.addColorStop(1, 'rgba(255, 140, 40, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new CanvasTexture(c)
}

const TRAIL_LEN = 56

export function buildPacket() {
  const group = new Group()

  const core = new Mesh(
    new BoxGeometry(0.55, 0.55, 0.55),
    new MeshStandardMaterial({
      color: 0x35200c,
      roughness: 0.35,
      emissive: 0xffa02e,
      emissiveIntensity: 1.35,
    }),
  )
  group.add(core)

  const halo = new Sprite(
    new SpriteMaterial({
      map: haloTexture(),
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  )
  halo.scale.setScalar(2.1)
  group.add(halo)

  const light = new PointLight(0xffa02e, 38, 15, 2)
  group.add(light)

  // trail: vertex colors fade amber → black; additive blending reads as decay
  const trailGeo = new BufferGeometry()
  const trailPos = new Float32Array(TRAIL_LEN * 3)
  const trailCol = new Float32Array(TRAIL_LEN * 3)
  for (let i = 0; i < TRAIL_LEN; i++) {
    const f = 1 - i / TRAIL_LEN
    trailCol.set([f * 1.0, f * 0.55, f * 0.16], i * 3)
  }
  trailGeo.setAttribute('position', new BufferAttribute(trailPos, 3))
  trailGeo.setAttribute('color', new BufferAttribute(trailCol, 3))
  const trail = new Line(
    trailGeo,
    new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  )
  trail.frustumCulled = false

  const pos = new Vector3()
  let trailInit = false

  return {
    group,
    trail,
    update(film: number, finale: number, t: number) {
      if (finale > 0.001) {
        FINALE_PATH.getPoint(Math.min(1, finale), pos)
        // settle on the doorstep: stop bobbing as it lands
        pos.y += Math.sin(t * 2.1) * 0.05 * (1 - finale)
      } else {
        FILM_PATH.getPoint(Math.min(1, Math.max(0, film)), pos)
        pos.y += Math.sin(t * 2.1) * 0.07
      }
      group.position.copy(pos)
      core.rotation.set(t * 0.7, t * 0.9, 0)

      // shift the trail buffer back one sample
      const a = trailGeo.getAttribute('position') as BufferAttribute
      const arr = a.array as Float32Array
      if (!trailInit) {
        for (let i = 0; i < TRAIL_LEN; i++) arr.set([pos.x, pos.y, pos.z], i * 3)
        trailInit = true
      }
      arr.copyWithin(3, 0, (TRAIL_LEN - 1) * 3)
      arr.set([pos.x, pos.y, pos.z], 0)
      a.needsUpdate = true
    },
  }
}
