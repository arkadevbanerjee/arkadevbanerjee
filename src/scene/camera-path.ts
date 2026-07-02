import { CatmullRomCurve3, PerspectiveCamera, Vector3 } from 'three'
import { CAMERA_KEYS, TARGET_KEYS, FINALE_CAM, FINALE_TARGET } from '../content/data'

const toCurve = (keys: [number, number, number][]) =>
  new CatmullRomCurve3(
    keys.map((p) => new Vector3(...p)),
    false,
    'centripetal',
  )

export function createRig() {
  const camCurve = toCurve(CAMERA_KEYS)
  const tgtCurve = toCurve(TARGET_KEYS)
  const finCamCurve = toCurve(FINALE_CAM)
  const finTgtCurve = toCurve(FINALE_TARGET)

  const pos = new Vector3()
  const tgt = new Vector3()
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

  return {
    /** film/finale: scroll progress (already smoothed), t: elapsed seconds */
    update(
      camera: PerspectiveCamera,
      film: number,
      finale: number,
      t: number,
      parallax: { x: number; y: number },
    ) {
      if (finale > 0.001) {
        finCamCurve.getPoint(clamp01(finale), pos)
        finTgtCurve.getPoint(clamp01(finale), tgt)
      } else {
        camCurve.getPoint(clamp01(film), pos)
        tgtCurve.getPoint(clamp01(film), tgt)
      }
      // handheld breathing + pointer parallax keep the shot alive
      pos.x += parallax.x * 0.7 + Math.sin(t * 0.4) * 0.09
      pos.y += parallax.y * 0.45 + Math.sin(t * 0.53) * 0.06
      camera.position.copy(pos)
      camera.lookAt(tgt)
    },
  }
}
