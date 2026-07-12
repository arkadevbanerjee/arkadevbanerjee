// Giant kinetic words composited INSIDE the 3D scenes — depth-tested so
// set-piece geometry occludes them as the camera moves (the Lusion trick).
import {
  CanvasTexture,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
} from 'three'
import { HOPS } from '../content/data'

// word plane placement per hop: nestled into each set-piece so geometry clips it
const PLACEMENTS: { pos: [number, number, number]; rotY: number; width: number }[] = [
  { pos: [1.5, 3.8, -40], rotY: -0.14, width: 14 },
  { pos: [0, 4.4, -75], rotY: 0.1, width: 15 },
  { pos: [0.5, 4.2, -110], rotY: -0.08, width: 16 },
  { pos: [0, 2.3, -142], rotY: 0.12, width: 15 },
  { pos: [0, 3.4, -177], rotY: 0, width: 15 },
]

function drawWord(canvas: HTMLCanvasElement, text: string) {
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = `700 300px "Clash Display", "Avenir Next Condensed", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // dim warm fill keeps the word under the bloom threshold — legible, not a floodlight
  ctx.fillStyle = 'rgba(226, 202, 164, 0.6)'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 14)
}

export function buildWords() {
  const group = new Group()
  const mats: MeshBasicMaterial[] = []
  const canvases: HTMLCanvasElement[] = []
  const textures: CanvasTexture[] = []

  HOPS.forEach((hop, i) => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 400
    drawWord(canvas, hop.word)
    const tex = new CanvasTexture(canvas)
    tex.minFilter = LinearFilter
    canvases.push(canvas)
    textures.push(tex)

    const { pos, rotY, width } = PLACEMENTS[i]
    const mat = new MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: true, // geometry in front of the plane occludes the word
    })
    const mesh = new Mesh(new PlaneGeometry(width, width * (400 / 2048)), mat)
    mesh.position.set(...pos)
    mesh.rotation.y = rotY
    group.add(mesh)
    mats.push(mat)
  })

  // redraw once the display font actually arrives
  document.fonts?.ready.then(() => {
    HOPS.forEach((hop, i) => {
      drawWord(canvases[i], hop.word)
      textures[i].needsUpdate = true
    })
  })

  return {
    group,
    // word widths are tuned for landscape framing; shrink them on narrow
    // viewports so they read as words instead of filling the frame clipped
    setScale(f: number) {
      group.children.forEach((mesh) => mesh.scale.setScalar(f))
    },
    update(film: number) {
      // hop i is fully framed at film = (i+1)/5 — fade the word in around it
      for (let i = 0; i < mats.length; i++) {
        const d = Math.abs(film * 5 - (i + 1))
        mats[i].opacity = Math.max(0, 1 - d * 1.9) * 0.65
      }
    },
  }
}
