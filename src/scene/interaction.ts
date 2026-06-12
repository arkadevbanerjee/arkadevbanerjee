import { PerspectiveCamera, Vector2, Vector3 } from 'three'
import type { NodeInfo, SceneUniforms } from './constellation'

interface Opts {
  camera: PerspectiveCamera
  nodes: NodeInfo[]
  uniforms: SceneUniforms
  coarse: boolean
}

// Hover/tap picking without a raycaster: project node centres to screen
// space and find the nearest one. ~100 projections/frame is negligible
// and, unlike raycasting, it works with shader-displaced sprites.
export function initInteraction({ camera, nodes, uniforms, coarse }: Opts) {
  const parallax = new Vector2()
  const targetParallax = new Vector2()
  const pointer = new Vector2(-9999, -9999)
  const tip = document.getElementById('node-tip')!
  const v = new Vector3()
  let hovered = -1
  let hideTimer: ReturnType<typeof setTimeout> | undefined

  if (coarse) {
    window.addEventListener(
      'pointerdown',
      (e) => pointer.set(e.clientX, e.clientY),
      { passive: true },
    )
  } else {
    window.addEventListener('pointermove', (e) => {
      targetParallax.set((e.clientX / innerWidth - 0.5) * 1.6, -(e.clientY / innerHeight - 0.5) * 1.0)
      pointer.set(e.clientX, e.clientY)
    })
  }

  function pick() {
    let best = -1
    let bestD = (coarse ? 42 : 30) ** 2
    let bestX = 0
    let bestY = 0
    for (let i = 0; i < nodes.length; i++) {
      v.copy(nodes[i].position).project(camera)
      if (v.z > 1 || v.z < -1) continue
      const sx = (v.x * 0.5 + 0.5) * innerWidth
      const sy = (-v.y * 0.5 + 0.5) * innerHeight
      const dx = sx - pointer.x
      const dy = sy - pointer.y
      const d = dx * dx + dy * dy
      if (d < bestD) {
        bestD = d
        best = i
        bestX = sx
        bestY = sy
      }
    }
    if (best !== hovered) {
      hovered = best
      uniforms.uHover.value = best < 0 ? -10 : best
      if (best >= 0) {
        const node = nodes[best]
        tip.textContent = `${node.label} · ${node.cluster}`
        tip.style.borderLeftColor = node.colorCss
        tip.classList.add('show')
        if (coarse) {
          clearTimeout(hideTimer)
          hideTimer = setTimeout(() => {
            tip.classList.remove('show')
            pointer.set(-9999, -9999)
          }, 1800)
        }
      } else {
        tip.classList.remove('show')
      }
    }
    if (best >= 0) {
      tip.style.left = `${bestX}px`
      tip.style.top = `${bestY}px`
    }
  }

  return {
    parallax,
    update(t: number) {
      if (coarse) {
        // no cursor on touch devices — a slow autonomous drift keeps it alive
        targetParallax.set(Math.sin(t * 0.3) * 0.5, Math.cos(t * 0.23) * 0.35)
      }
      parallax.lerp(targetParallax, 0.05)
      pick()
    },
  }
}
