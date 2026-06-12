// Scene configuration — the constellation IS the career story.
// Hues must match the CSS custom properties in styles/tokens.css.

export interface ClusterDef {
  key: 'ingress' | 'catalogue' | 'platform' | 'inference' | 'ops'
  color: number
  center: [number, number, number]
  radius: number
  count: number
  services: string[]
}

export const CLUSTERS: ClusterDef[] = [
  {
    key: 'ingress',
    color: 0x38e1ff,
    center: [-13, 2.5, -4],
    radius: 5,
    count: 18,
    services: ['pricing-scraper', 'benchmark-etl', 'market-watch', 'price-engine', 'crawler-fleet'],
  },
  {
    key: 'catalogue',
    color: 0xa78bfa,
    center: [11, -2, -20],
    radius: 6,
    count: 26,
    services: ['product-store', 'sku-api', 'search-indexer', 'media-cdn', 'attr-schema', 'seller-gw'],
  },
  {
    key: 'platform',
    color: 0xffc14d,
    center: [-7, -4, -36],
    radius: 7,
    count: 32,
    services: ['order-service', 'payment-gw', 'cart-api', 'kafka-bus', 'notif-hub', 'idempotency-store', 'rate-limiter'],
  },
  {
    key: 'inference',
    color: 0x3ee6a0,
    center: [12, 4.5, -52],
    radius: 5.5,
    count: 22,
    services: ['recsys-train', 'feature-store', 'embed-cache', 'rank-api', 'ab-splitter'],
  },
  {
    key: 'ops',
    color: 0xff6ec7,
    center: [-10, 2, -68],
    radius: 6,
    count: 26,
    services: ['capacity-engine', 'atomic-caps', 'route-planner', 'slot-allocator', 'wms-sync', 'fleet-tracker'],
  },
]

// Camera flythrough keyframes: index 0 = hero overview, then one per chapter.
// each chapter camera sits ~16-19 units from its cluster so the
// constellation frames the text instead of engulfing it
export const CAMERA_KEYS: [number, number, number][] = [
  [0, 3, 17],
  [-5, 5, 10],
  [2, 1, -4],
  [3, 0, -20],
  [2, 8, -37],
  [0, 5, -52],
]

export const TARGET_KEYS: [number, number, number][] = [
  [0, 0, -28],
  [-13, 2.5, -4],
  [11, -2, -20],
  [-7, -4, -36],
  [12, 4.5, -52],
  [-10, 2, -68],
]
