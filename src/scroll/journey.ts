import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState } from './state'

gsap.registerPlugin(ScrollTrigger)

export function initJourney() {
  const track = document.querySelector<HTMLElement>('.journey-track')
  if (!track) return
  const chapters = gsap.utils.toArray<HTMLElement>('.chapter')
  const counter = document.getElementById('ch-now')
  const n = chapters.length

  // chapter crossfades across the pinned stage
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate(self) {
        scrollState.chapters = self.progress
        if (counter) {
          const idx = Math.min(n - 1, Math.floor(self.progress * n))
          counter.textContent = String(idx + 1).padStart(2, '0')
        }
      },
    },
  })
  chapters.forEach((ch, i) => {
    tl.fromTo(
      ch,
      { autoAlpha: 0, y: 90 },
      { autoAlpha: 1, y: 0, duration: 0.3, ease: 'none' },
      i + (i === 0 ? 0 : 0.06),
    )
    if (i < n - 1) tl.to(ch, { autoAlpha: 0, y: -90, duration: 0.26, ease: 'none' }, i + 0.72)
  })
  // pad to exactly n so chapter i occupies scroll window [i/n, (i+1)/n]
  tl.set({}, {}, n)

  // camera flythrough: begins while the hero scrolls out, ends with the pin
  ScrollTrigger.create({
    trigger: track,
    start: 'top bottom',
    end: 'bottom bottom',
    scrub: true,
    onUpdate(self) {
      scrollState.progress = self.progress
    },
  })

  // past the journey the constellation recedes into a backdrop
  gsap.to('#scene', {
    opacity: 0.16,
    ease: 'none',
    scrollTrigger: { trigger: '#registry', start: 'top 90%', end: 'top 30%', scrub: true },
  })

  // header progress line
  gsap.to('.scroll-progress span', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: true },
  })
}
