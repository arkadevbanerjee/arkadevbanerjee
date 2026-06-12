import { CatmullRomCurve3, PerspectiveCamera, Vector2, Vector3 } from 'three'
import { CAMERA_KEYS, TARGET_KEYS } from '../content/data'

export function createRig() {
  const camCurve = new CatmullRomCurve3(
    CAMERA_KEYS.map((p) => new Vector3(...p)),
    false,
    'centripetal',
  )
  const tgtCurve = new CatmullRomCurve3(
    TARGET_KEYS.map((p) => new Vector3(...p)),
    false,
    'centripetal',
  )
  const pos = new Vector3()
  const tgt = new Vector3()

  return {
    /** p: flythrough progress 0..1 (already smoothed), t: elapsed seconds */
    update(camera: PerspectiveCamera, p: number, t: number, parallax: Vector2) {
      camCurve.getPoint(p, pos)
      tgtCurve.getPoint(p, tgt)
      const driftX = Math.sin(t * 0.22) * 0.45
      const driftY = Math.cos(t * 0.17) * 0.3
      camera.position.set(pos.x + parallax.x + driftX, pos.y + parallax.y + driftY, pos.z)
      camera.lookAt(tgt)
    },
  }
}
