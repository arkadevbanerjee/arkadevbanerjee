import './styles/tokens.css'
import './styles/base.css'
import './styles/sections.css'
import './styles/fallback.css'

const docEl = document.documentElement

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const hasWebGL2 = (() => {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
})()
const lowEnd = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 3
const use3D = !reducedMotion && hasWebGL2 && !lowEnd

if (!use3D) docEl.classList.add('no-3d')

if (reducedMotion) {
  // fully static reading experience: journey unrolls as plain sections
  docEl.classList.add('static-journey')
} else {
  const [{ initLenis }, { initJourney }, { initKinetic }] = await Promise.all([
    import('./scroll/lenis-setup'),
    import('./scroll/journey'),
    import('./text/kinetic'),
  ])
  initLenis()
  initJourney()
  initKinetic()

  if (use3D) {
    // three.js lives in its own chunk — fallback visitors never download it
    import('./scene')
      .then(({ initScene }) => initScene(document.getElementById('scene') as HTMLCanvasElement))
      .catch((err) => {
        console.warn('3D scene unavailable, falling back to CSS backdrop', err)
        docEl.classList.add('no-3d')
      })
  }
}
