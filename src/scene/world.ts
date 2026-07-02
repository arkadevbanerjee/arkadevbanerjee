// The five set-pieces the order travels through, plus the night-city finale.
// Everything is instanced primitives under one warm key light — the cinematic
// look comes from bloom + fog + the packet's travelling point light.
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Points,
  PointsMaterial,
  TorusGeometry,
  Vector3,
} from 'three'
import { HOPS, CITY_Z } from '../content/data'

const AMBER = 0xffa02e
const EMBER = 0xe6500a
const DARK = 0x241809
const DARKER = 0x170f07

// deterministic pseudo-random so layouts are stable between reloads
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const dummy = new Object3D()

function structural() {
  return new MeshStandardMaterial({ color: DARK, roughness: 0.92, metalness: 0.1 })
}
function glow(color = AMBER, opacity = 1) {
  return new MeshBasicMaterial({ color, transparent: opacity < 1, opacity })
}

/* ---------- hero: the conveyor the order starts on ---------- */
function buildConveyor(group: Group) {
  const belt = new Mesh(new BoxGeometry(5.6, 0.35, 30), structural())
  belt.position.set(0, 0.5, -4)
  group.add(belt)

  const rail = new BoxGeometry(0.18, 0.5, 30)
  const railL = new Mesh(rail, new MeshStandardMaterial({ color: DARKER, roughness: 0.85 }))
  railL.position.set(-2.95, 0.75, -4)
  const railR = railL.clone()
  railR.position.x = 2.95
  group.add(railL, railR)

  const rollers = new InstancedMesh(
    new CylinderGeometry(0.16, 0.16, 6, 10),
    new MeshStandardMaterial({ color: DARKER, roughness: 0.7, metalness: 0.35 }),
    20,
  )
  for (let i = 0; i < 20; i++) {
    dummy.position.set(0, 0.18, 8 - i * 1.6)
    dummy.rotation.set(0, 0, Math.PI / 2)
    dummy.updateMatrix()
    rollers.setMatrixAt(i, dummy.matrix)
  }
  group.add(rollers)

  // travelling centre-line dashes — the belt reads as *moving*.
  // Kept behind z=2 so none of them balloon right in front of the hero camera.
  const dashes = new InstancedMesh(new BoxGeometry(0.1, 0.02, 0.7), glow(AMBER, 0.7), 15)
  for (let i = 0; i < 15; i++) {
    dummy.position.set(0, 0.69, 2 - i * 2)
    dummy.rotation.set(0, 0, 0)
    dummy.updateMatrix()
    dashes.setMatrixAt(i, dummy.matrix)
  }
  group.add(dashes)
  return dashes
}

/* ---------- hop 1: ingress funnel ---------- */
function buildIngress(group: Group, z: number, mul: number) {
  const swarm = new Group()
  swarm.position.set(0, 2, z)

  const n = Math.round(150 * mul)
  const bits = new InstancedMesh(new BoxGeometry(0.16, 0.16, 0.16), structural(), n)
  const rand = rng(1207)
  for (let i = 0; i < n; i++) {
    const t = i / n
    const a = t * Math.PI * 14 + rand() * 0.6
    const r = 0.9 + 8.5 * (1 - t) + rand() * 0.8
    dummy.position.set(Math.cos(a) * r, (rand() - 0.5) * (1 - t) * 6, (1 - t) * 7 - 2 + rand())
    dummy.rotation.set(rand() * 3, rand() * 3, 0)
    const s = 0.6 + rand() * 1.3
    dummy.scale.setScalar(s)
    dummy.updateMatrix()
    bits.setMatrixAt(i, dummy.matrix)
  }
  swarm.add(bits)

  // a handful of hot fragments so the funnel glitters through bloom
  const hot = new InstancedMesh(new BoxGeometry(0.12, 0.12, 0.12), glow(AMBER), Math.round(24 * mul))
  for (let i = 0; i < hot.count; i++) {
    const t = rand()
    const a = t * Math.PI * 14
    const r = 0.9 + 8.5 * (1 - t)
    dummy.position.set(Math.cos(a) * r, (rand() - 0.5) * (1 - t) * 6, (1 - t) * 7 - 2)
    dummy.scale.setScalar(0.8 + rand())
    dummy.rotation.set(0, 0, 0)
    dummy.updateMatrix()
    hot.setMatrixAt(i, dummy.matrix)
  }
  swarm.add(hot)

  const ring = new Mesh(new TorusGeometry(1.5, 0.05, 10, 48), glow(AMBER))
  ring.position.set(0, 0, -2.6)
  swarm.add(ring)
  group.add(swarm)
  return swarm
}

/* ---------- hop 2: catalogue aisle ---------- */
function buildCatalogue(group: Group, z: number, mul: number) {
  const rand = rng(2023)
  const rows = 7
  const cols = Math.round(16 * mul)
  const boxGeo = new BoxGeometry(0.8, 0.8, 0.8)

  for (const side of [-1, 1]) {
    const wall = new InstancedMesh(boxGeo, structural(), rows * cols)
    let k = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (rand() < 0.12) {
          // gaps make it read as shelving, not a wall
          dummy.scale.setScalar(0.0001)
        } else {
          dummy.scale.set(0.7 + rand() * 0.3, 0.55 + rand() * 0.45, 0.7 + rand() * 0.3)
        }
        dummy.position.set(side * 4.3, 0.6 + r * 1.05, z + 8 - c * 1.1)
        dummy.rotation.set(0, (rand() - 0.5) * 0.12, 0)
        dummy.updateMatrix()
        wall.setMatrixAt(k++, dummy.matrix)
      }
    }
    group.add(wall)

    // shelf rails
    for (let r = 0; r <= rows; r++) {
      const shelf = new Mesh(
        new BoxGeometry(1.1, 0.06, cols * 1.1 + 1),
        new MeshStandardMaterial({ color: DARKER, roughness: 0.8 }),
      )
      shelf.position.set(side * 4.3, 0.08 + r * 1.05, z + 8 - (cols * 1.1) / 2)
      group.add(shelf)
    }
  }

  // picked SKUs glowing on the shelves
  const picks = new InstancedMesh(new BoxGeometry(0.5, 0.5, 0.5), glow(AMBER), Math.round(12 * mul))
  for (let i = 0; i < picks.count; i++) {
    const side = rand() > 0.5 ? 1 : -1
    dummy.position.set(
      side * 3.9,
      0.72 + Math.floor(rand() * rows) * 1.05,
      z + 8 - Math.floor(rand() * cols) * 1.1,
    )
    dummy.rotation.set(0, rand(), 0)
    dummy.scale.setScalar(0.7 + rand() * 0.5)
    dummy.updateMatrix()
    picks.setMatrixAt(i, dummy.matrix)
  }
  group.add(picks)
}

/* ---------- hop 3: platform lanes (partitions feeding the gate) ---------- */
function buildPlatform(group: Group, z: number, mul: number) {
  const rand = rng(777)
  const lanes: Group[] = []
  const laneCount = 5
  for (let l = 0; l < laneCount; l++) {
    const x = (l - (laneCount - 1) / 2) * 1.6
    const rail = new Mesh(new BoxGeometry(0.9, 0.1, 20), structural())
    rail.position.set(x, 0.5, z + 3)
    group.add(rail)

    const lane = new Group()
    const q = Math.round(9 * mul)
    const cubes = new InstancedMesh(
      new BoxGeometry(0.42, 0.42, 0.42),
      new MeshStandardMaterial({
        color: 0x3a2410,
        roughness: 0.6,
        emissive: EMBER,
        emissiveIntensity: 0.35,
      }),
      q,
    )
    for (let i = 0; i < q; i++) {
      dummy.position.set(x, 0.82, z + 11 - i * 2.1 - rand() * 0.6)
      dummy.rotation.set(0, rand() * 0.4, 0)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      cubes.setMatrixAt(i, dummy.matrix)
    }
    lane.add(cubes)
    lane.userData.speed = 0.55 + l * 0.17
    group.add(lane)
    lanes.push(lane)
  }

  const gate = new Mesh(new TorusGeometry(2.4, 0.07, 10, 56), glow(AMBER))
  gate.position.set(0, 1.6, z - 7)
  group.add(gate)

  const gateInner = new Mesh(new TorusGeometry(1.7, 0.03, 8, 48), glow(EMBER, 0.8))
  gateInner.position.copy(gate.position)
  group.add(gateInner)
  return { lanes, gate, gateInner }
}

/* ---------- hop 4: inference field ---------- */
function buildInference(group: Group, z: number, mul: number) {
  const rand = rng(42)
  const field = new Group()
  field.position.set(0, 2.2, z)

  const n = Math.round(320 * mul)
  const pos = new Float32Array(n * 3)
  const pts: Vector3[] = []
  for (let i = 0; i < n; i++) {
    const v = new Vector3((rand() - 0.5) * 15, (rand() - 0.5) * 7, (rand() - 0.5) * 15)
    pts.push(v)
    pos.set([v.x, v.y, v.z], i * 3)
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  field.add(
    new Points(
      geo,
      new PointsMaterial({
        color: AMBER,
        size: 0.09,
        transparent: true,
        opacity: 0.85,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    ),
  )

  // sparse synapse lines between near neighbours
  const linePos: number[] = []
  for (let i = 0; i < n; i++) {
    for (let tries = 0; tries < 2; tries++) {
      const j = Math.floor(rand() * n)
      if (j !== i && pts[i].distanceTo(pts[j]) < 2.6) linePos.push(...pts[i].toArray(), ...pts[j].toArray())
    }
  }
  const lineGeo = new BufferGeometry()
  lineGeo.setAttribute('position', new BufferAttribute(new Float32Array(linePos), 3))
  field.add(
    new LineSegments(
      lineGeo,
      new LineBasicMaterial({
        color: EMBER,
        transparent: true,
        opacity: 0.22,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    ),
  )
  group.add(field)
  return field
}

/* ---------- finale: the night city ---------- */
function buildCity(group: Group, mul: number) {
  const rand = rng(700155)
  const grid = 15
  const spacing = 2.3
  const towers = new InstancedMesh(new BoxGeometry(1.3, 1, 1.3), structural(), grid * grid)
  let k = 0
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const x = (i - grid / 2) * spacing + (rand() - 0.5)
      const zz = CITY_Z + (j - grid / 2) * spacing + (rand() - 0.5)
      // keep the doorstep block clear
      const nearDoor = Math.abs(x - 0.5) < 2.2 && Math.abs(zz - -211) < 2.2
      const h = nearDoor ? 0.0001 : 0.6 + Math.pow(rand(), 1.8) * 5.5
      dummy.position.set(x, h / 2, zz)
      dummy.scale.set(0.7 + rand() * 0.5, h, 0.7 + rand() * 0.5)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      towers.setMatrixAt(k++, dummy.matrix)
    }
  }
  group.add(towers)

  // window lights
  const wn = Math.round(420 * mul)
  const wpos = new Float32Array(wn * 3)
  for (let i = 0; i < wn; i++) {
    wpos.set(
      [
        (rand() - 0.5) * grid * spacing,
        0.3 + rand() * 4.5,
        CITY_Z + (rand() - 0.5) * grid * spacing,
      ],
      i * 3,
    )
  }
  const wgeo = new BufferGeometry()
  wgeo.setAttribute('position', new BufferAttribute(wpos, 3))
  group.add(
    new Points(
      wgeo,
      new PointsMaterial({
        color: 0xffd9a0,
        size: 0.07,
        transparent: true,
        opacity: 0.75,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    ),
  )

  // the doorstep — where this order (and the site) ends
  const pad = new Mesh(new BoxGeometry(1.4, 0.06, 1.4), glow(AMBER))
  pad.position.set(0.5, 0.03, -211)
  group.add(pad)
  const padRing = new Mesh(new TorusGeometry(1.1, 0.03, 8, 40), glow(EMBER, 0.9))
  padRing.rotation.x = Math.PI / 2
  padRing.position.set(0.5, 0.08, -211)
  group.add(padRing)
  return { pad, padRing }
}

/* ---------- ambient dust across the whole corridor ---------- */
function buildDust(group: Group, mul: number) {
  const rand = rng(9)
  const n = Math.round(380 * mul)
  const pos = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    pos.set([(rand() - 0.5) * 26, rand() * 9, 10 - rand() * 235], i * 3)
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  group.add(
    new Points(
      geo,
      new PointsMaterial({
        color: 0xffc98a,
        size: 0.05,
        transparent: true,
        opacity: 0.4,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    ),
  )
}

/* ---------- hop 5: the depot yard seen from above ---------- */
function buildDepot(group: Group, z: number, mul: number) {
  const rand = rng(2610)
  const n = Math.round(110 * mul)
  const containers = new InstancedMesh(new BoxGeometry(1.6, 0.9, 0.8), structural(), n)
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 14)
    const col = i % 14
    dummy.position.set(
      -11 + col * 1.75 + (rand() - 0.5) * 0.3,
      0.45 + Math.floor(rand() * 2.2) * 0.95,
      z + 7 - row * 2.0 + (rand() - 0.5) * 0.3,
    )
    dummy.rotation.set(0, (rand() - 0.5) * 0.06, 0)
    dummy.scale.setScalar(rand() < 0.12 ? 0.0001 : 0.85 + rand() * 0.3)
    dummy.updateMatrix()
    containers.setMatrixAt(i, dummy.matrix)
  }
  group.add(containers)

  // dock lights punctuating the yard
  const lights = new InstancedMesh(new BoxGeometry(0.14, 0.14, 0.14), glow(AMBER), Math.round(16 * mul))
  for (let i = 0; i < lights.count; i++) {
    dummy.position.set(-11 + rand() * 24, 0.4 + rand() * 2.4, z + 7 - rand() * 16)
    dummy.rotation.set(0, 0, 0)
    dummy.scale.setScalar(0.8 + rand() * 0.6)
    dummy.updateMatrix()
    lights.setMatrixAt(i, dummy.matrix)
  }
  group.add(lights)
}

export function buildWorld(mul: number) {
  const group = new Group()

  const dashes = buildConveyor(group)
  const swarm = buildIngress(group, HOPS[0].z, mul)
  buildCatalogue(group, HOPS[1].z, mul)
  const platform = buildPlatform(group, HOPS[2].z, mul)
  const field = buildInference(group, HOPS[3].z, mul)
  buildDepot(group, HOPS[4].z, mul)

  // hop 5 (ops) is the overview: the network seen from above is the set-piece —
  // a floor grid ties the corridor together under the rising camera
  const gridPos: number[] = []
  for (let i = -8; i <= 8; i++) {
    gridPos.push(i * 3, 0, 12, i * 3, 0, -226)
  }
  for (let j = 0; j >= -226; j -= 6) {
    gridPos.push(-24, 0, j, 24, 0, j)
  }
  const gridGeo = new BufferGeometry()
  gridGeo.setAttribute('position', new BufferAttribute(new Float32Array(gridPos), 3))
  group.add(
    new LineSegments(
      gridGeo,
      new LineBasicMaterial({ color: 0x54371c, transparent: true, opacity: 0.35 }),
    ),
  )

  const city = buildCity(group, mul)
  buildDust(group, mul)

  const dashMatrix = new Matrix4()
  return {
    group,
    update(t: number) {
      // conveyor dashes crawl forward and wrap
      const shift = (t * 1.6) % 2
      for (let i = 0; i < 15; i++) {
        dummy.position.set(0, 0.69, 2 - i * 2 + shift)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        dashMatrix.copy(dummy.matrix)
        dashes.setMatrixAt(i, dashMatrix)
      }
      dashes.instanceMatrix.needsUpdate = true

      swarm.rotation.z = t * 0.12
      field.rotation.y = t * 0.05

      for (const lane of platform.lanes) {
        lane.position.z = -((t * lane.userData.speed) % 2.1)
      }
      const pulse = 1 + Math.sin(t * 2.2) * 0.035
      platform.gate.scale.setScalar(pulse)
      platform.gateInner.rotation.z = t * 0.6
      city.padRing.rotation.z = t * 0.8
    },
  }
}
