import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Object3D,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Vector3,
} from 'three'
import { SpriteNodeMaterial } from 'three/webgpu'
import { float, fract, instancedBufferAttribute, mix, uniform, uv, vec2, vec4 } from 'three/tsl'
import { CLUSTERS } from '../content/data'

export interface NodeInfo {
  position: Vector3
  label: string
  cluster: string
  colorCss: string
}

export interface SceneUniforms {
  uTime: { value: number }
  uActive: { value: number }
  uHover: { value: number }
}

interface EdgeDef {
  a: number
  b: number
  cluster: number // which cluster's activation makes this edge's packets surge
  trunk: boolean
}

// deterministic layout — same constellation on every visit
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildConstellation(opts: { mul: number; stars: number }) {
  const rnd = mulberry32(20211213) // joined CityMall Dec 2021

  const uTime = uniform(0)
  const uActive = uniform(-1)
  const uHover = uniform(-10)

  // ---------- graph generation ----------
  const nodes: NodeInfo[] = []
  const nodePos: Vector3[] = []
  const nodeColor: Color[] = []
  const nodeSize: number[] = []
  const nodeCluster: number[] = []
  const clusterRanges: [number, number][] = []

  CLUSTERS.forEach((cluster, ci) => {
    const start = nodes.length
    const count = Math.max(6, Math.round(cluster.count * opts.mul))
    const center = new Vector3(...cluster.center)
    const color = new Color(cluster.color)
    const css = '#' + color.getHexString()

    for (let i = 0; i < count; i++) {
      const isHub = i === 0
      const dir = new Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize()
      const dist = isHub ? 0 : cluster.radius * (0.3 + 0.7 * Math.cbrt(rnd()))
      const p = center.clone().addScaledVector(dir, dist)
      const replica = Math.floor(i / cluster.services.length)
      const label = cluster.services[i % cluster.services.length] + (replica > 0 ? `-${replica + 1}` : '')

      nodePos.push(p)
      nodeColor.push(color)
      nodeSize.push(isHub ? 1.7 : 0.55 + rnd() * 0.6)
      nodeCluster.push(ci)
      nodes.push({ position: p, label, cluster: cluster.key, colorCss: css })
    }
    clusterRanges.push([start, nodes.length])
  })

  // edges: each node links to its 2 nearest earlier siblings in the cluster
  const edges: EdgeDef[] = []
  clusterRanges.forEach(([start, end], ci) => {
    for (let i = start + 1; i < end; i++) {
      const dists: { j: number; d: number }[] = []
      for (let j = start; j < i; j++) dists.push({ j, d: nodePos[i].distanceToSquared(nodePos[j]) })
      dists.sort((x, y) => x.d - y.d)
      const links = i - start < 2 ? 1 : 2
      for (let k = 0; k < links; k++) edges.push({ a: i, b: dists[k].j, cluster: ci, trunk: false })
    }
  })
  // trunk lines between consecutive clusters (the career path itself)
  for (let ci = 0; ci < clusterRanges.length - 1; ci++) {
    const [aStart, aEnd] = clusterRanges[ci]
    const [bStart, bEnd] = clusterRanges[ci + 1]
    edges.push({ a: aStart, b: bStart, cluster: ci + 1, trunk: true }) // hub to hub
    for (let k = 0; k < 2; k++) {
      const a = aStart + 1 + Math.floor(rnd() * (aEnd - aStart - 1))
      const b = bStart + 1 + Math.floor(rnd() * (bEnd - bStart - 1))
      edges.push({ a, b, cluster: ci + 1, trunk: true })
    }
  }

  // ---------- node sprites (core + halo in one shader) ----------
  // WebGPU caps pipelines at 8 vertex buffers, so instanced data is packed
  // into as few vec4 attributes as possible.
  const n = nodes.length
  const posSizeArr = new Float32Array(n * 4) // xyz = position, w = size
  const colPhaseArr = new Float32Array(n * 4) // rgb = colour, w = pulse phase
  const clusterIndexArr = new Float32Array(n * 2) // x = cluster, y = node index
  for (let i = 0; i < n; i++) {
    nodePos[i].toArray(posSizeArr, i * 4)
    posSizeArr[i * 4 + 3] = nodeSize[i]
    nodeColor[i].toArray(colPhaseArr, i * 4)
    colPhaseArr[i * 4 + 3] = rnd() * Math.PI * 2
    clusterIndexArr[i * 2] = nodeCluster[i]
    clusterIndexArr[i * 2 + 1] = i
  }

  const aPosSize = instancedBufferAttribute(new InstancedBufferAttribute(posSizeArr, 4))
  const aColPhase = instancedBufferAttribute(new InstancedBufferAttribute(colPhaseArr, 4))
  const aClusterIndex = instancedBufferAttribute(new InstancedBufferAttribute(clusterIndexArr, 2))
  const aPos = aPosSize.xyz
  const aCol = aColPhase.xyz
  const aSize = aPosSize.w
  const aPhase = aColPhase.w
  const aCluster = aClusterIndex.x
  const aIndex = aClusterIndex.y

  const nodeMat = new SpriteNodeMaterial({
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  })
  const nodeActive = float(1).sub(aCluster.sub(uActive).abs().clamp(0, 1))
  const nodeHover = float(1).sub(aIndex.sub(uHover).abs().clamp(0, 1))
  const nodePulse = aPhase.add(uTime.mul(1.6)).sin().mul(0.1).add(1)
  nodeMat.positionNode = aPos
  nodeMat.scaleNode = aSize
    .mul(nodePulse)
    .mul(nodeActive.mul(0.5).add(1))
    .mul(nodeHover.mul(0.9).add(1))
  const nd = uv().sub(vec2(0.5)).length().mul(2).clamp(0, 1)
  const core = nd.oneMinus().pow(8)
  const halo = nd.oneMinus().pow(2.5).mul(0.42)
  nodeMat.colorNode = vec4(
    aCol,
    core.add(halo).mul(nodeActive.mul(1.1).add(0.8)).mul(nodeHover.add(1)).clamp(0, 1),
  )

  const quad = new PlaneGeometry(1, 1)
  quad.deleteAttribute('normal') // sprites are unlit; saves a vertex buffer
  const nodeMesh = new InstancedMesh(quad, nodeMat, n)
  nodeMesh.frustumCulled = false
  nodeMesh.renderOrder = 1

  // ---------- edges ----------
  const epos = new Float32Array(edges.length * 6)
  const ecol = new Float32Array(edges.length * 6)
  edges.forEach((e, i) => {
    nodePos[e.a].toArray(epos, i * 6)
    nodePos[e.b].toArray(epos, i * 6 + 3)
    const ca = nodeColor[e.a]
    const cb = nodeColor[e.b]
    ca.toArray(ecol, i * 6)
    cb.toArray(ecol, i * 6 + 3)
  })
  const edgeGeo = new BufferGeometry()
  edgeGeo.setAttribute('position', new BufferAttribute(epos, 3))
  edgeGeo.setAttribute('color', new BufferAttribute(ecol, 3))
  const edgeMat = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.14,
    blending: AdditiveBlending,
    depthWrite: false,
  })
  const edgeMesh = new LineSegments(edgeGeo, edgeMat)
  edgeMesh.frustumCulled = false
  edgeMesh.renderOrder = 0

  // ---------- packets (light travelling along edges) ----------
  const packets: { edge: EdgeDef; reverse: boolean }[] = []
  edges.forEach((e) => {
    const count = e.trunk ? 4 : rnd() < 0.6 ? 1 : 0
    for (let k = 0; k < count; k++) packets.push({ edge: e, reverse: rnd() < 0.4 })
  })
  const pn = packets.length
  const pStartPhase = new Float32Array(pn * 4) // xyz = from, w = phase
  const pEndSpeed = new Float32Array(pn * 4) // xyz = to, w = speed
  const pColSize = new Float32Array(pn * 4) // rgb = colour, w = size
  const pClusterArr = new Float32Array(pn)
  packets.forEach((p, i) => {
    const from = p.reverse ? p.edge.b : p.edge.a
    const to = p.reverse ? p.edge.a : p.edge.b
    nodePos[from].toArray(pStartPhase, i * 4)
    pStartPhase[i * 4 + 3] = rnd()
    nodePos[to].toArray(pEndSpeed, i * 4)
    pEndSpeed[i * 4 + 3] = p.edge.trunk ? 0.05 + rnd() * 0.05 : 0.1 + rnd() * 0.18
    nodeColor[from].clone().lerp(new Color(0xffffff), 0.35).toArray(pColSize, i * 4)
    pColSize[i * 4 + 3] = p.edge.trunk ? 0.5 : 0.3 + rnd() * 0.15
    pClusterArr[i] = p.edge.cluster
  })

  const aStartPhase = instancedBufferAttribute(new InstancedBufferAttribute(pStartPhase, 4))
  const aEndSpeed = instancedBufferAttribute(new InstancedBufferAttribute(pEndSpeed, 4))
  const aColSize = instancedBufferAttribute(new InstancedBufferAttribute(pColSize, 4))
  const aStart = aStartPhase.xyz
  const aEnd = aEndSpeed.xyz
  const aPCol = aColSize.xyz
  const aPPhase = aStartPhase.w
  const aPSpeed = aEndSpeed.w
  const aPSize = aColSize.w
  const aPCluster = instancedBufferAttribute(new InstancedBufferAttribute(pClusterArr, 1))

  const packetMat = new SpriteNodeMaterial({
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  })
  const pActive = float(1).sub(aPCluster.sub(uActive).abs().clamp(0, 1))
  const pt = fract(uTime.mul(aPSpeed).add(aPPhase))
  packetMat.positionNode = mix(aStart, aEnd, pt)
  packetMat.scaleNode = aPSize.mul(pActive.mul(0.8).add(1))
  const pd = uv().sub(vec2(0.5)).length().mul(2).clamp(0, 1)
  const pGlow = pd.oneMinus().pow(5)
  const endFade = pt.sub(0.5).abs().mul(2).oneMinus().mul(4).clamp(0, 1)
  packetMat.colorNode = vec4(aPCol, pGlow.mul(endFade).mul(pActive.mul(1.6).add(0.45)).clamp(0, 1))

  const packetMesh = new InstancedMesh(quad, packetMat, pn)
  packetMesh.frustumCulled = false
  packetMesh.renderOrder = 2

  // ---------- ambient starfield ----------
  const sCount = opts.stars
  const sPos = new Float32Array(sCount * 3)
  for (let i = 0; i < sCount; i++) {
    sPos[i * 3] = (rnd() * 2 - 1) * 70
    sPos[i * 3 + 1] = (rnd() * 2 - 1) * 40
    sPos[i * 3 + 2] = -95 + rnd() * 120
  }
  const starGeo = new BufferGeometry()
  starGeo.setAttribute('position', new BufferAttribute(sPos, 3))
  const starMat = new PointsMaterial({
    color: 0x9fb2d8,
    size: 0.07,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  })
  const stars = new Points(starGeo, starMat)
  stars.frustumCulled = false

  const objects: Object3D[] = [stars, edgeMesh, nodeMesh, packetMesh]
  const uniforms: SceneUniforms = { uTime, uActive, uHover }
  return { objects, nodes, uniforms }
}
