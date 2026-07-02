// Shared scroll state: written by scroll/journey.ts, read by the 3D scene
// each frame. Keeps the scene chunk fully decoupled from GSAP wiring.
export const scrollState = {
  /** film progress: 0 = hero conveyor → 1 = ops overview (end of pinned hops) */
  film: 0,
  /** finale progress: 0 → 1 across the delivered section (city descent) */
  finale: 0,
}
