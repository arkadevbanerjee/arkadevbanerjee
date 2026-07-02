// Film configuration — one order travelling through the machine.
// Each hop is a career chapter AND a 3D set-piece along the -Z axis.

export interface HopDef {
  key: 'ingress' | 'catalogue' | 'platform' | 'inference' | 'ops'
  /** giant depth-composited word rendered inside the 3D scene */
  word: string
  /** waybill status shown on the order rail */
  status: string
  /** set-piece center on the z axis */
  z: number
}

export const HOPS: HopDef[] = [
  { key: 'ingress',   word: 'INGRESS',   status: 'RECEIVED',         z: -34 },
  { key: 'catalogue', word: 'CATALOGUE', status: 'CATALOGUED',       z: -68 },
  { key: 'platform',  word: 'THROUGHPUT', status: 'PROCESSED',       z: -102 },
  { key: 'inference', word: 'INFERENCE', status: 'RANKED',           z: -136 },
  { key: 'ops',       word: 'CAPACITY',  status: 'OUT FOR DELIVERY', z: -170 },
]

/** z position of the hero conveyor set-piece */
export const HERO_Z = 0
/** z position of the night-city finale */
export const CITY_Z = -210

export const WAYBILL_START = 'ORDER PLACED'
export const WAYBILL_END = 'DELIVERED'

// Camera keyframes for the film: hero, then one per hop.
// Kept slightly off-axis so set-pieces frame the DOM copy (left third clear).
export const CAMERA_KEYS: [number, number, number][] = [
  [0.0, 2.6, 9.5],      // hero — low over the conveyor
  [-2.6, 2.2, -25],     // ingress — packet frames right of the chapter card
  [-3.4, 1.6, -59],     // catalogue — inside the aisle
  [3.6, 2.4, -93],      // platform — alongside the lanes
  [-3.2, 2.2, -127],    // inference
  [0.0, 10.0, -158],    // ops — rising above the network
]

export const TARGET_KEYS: [number, number, number][] = [
  [0, 1.2, 0],
  [-3.6, 1.2, -34.5],
  [-0.8, 1.4, -68],
  [1.0, 1.2, -102],
  [-0.8, 1.6, -136],
  [0, 1.0, -170],
]

// Finale: descend over the night city toward one doorstep.
export const FINALE_CAM: [number, number, number][] = [
  [0, 10.0, -158],
  [0, 26, -186],
  [0.5, 7, -202],
]
export const FINALE_TARGET: [number, number, number][] = [
  [0, 1.0, -170],
  [0, 0, -210],
  [0.5, 0.4, -211],
]
