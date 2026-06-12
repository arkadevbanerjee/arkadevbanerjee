// Shared scroll state: written by scroll/journey.ts, read by the 3D scene
// each frame. Keeps the scene chunk fully decoupled from GSAP wiring.
export const scrollState = {
  /** camera flythrough progress, 0 = hero overview → 1 = final cluster */
  progress: 0,
  /** chapter narrative progress across the pinned journey, 0..1 */
  chapters: 0,
}
