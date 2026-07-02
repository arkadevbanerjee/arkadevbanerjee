import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState } from './state'
import { HOPS, WAYBILL_START, WAYBILL_END } from '../content/data'

gsap.registerPlugin(ScrollTrigger)

export function initJourney() {
  const track = document.querySelector<HTMLElement>('.film-track')
  if (!track) return
  const chapters = gsap.utils.toArray<HTMLElement>('.chapter')
  const counter = document.getElementById('hop-now')
  const railStatus = document.getElementById('rail-status')
  const n = chapters.length

  let lastStatus = ''
  const setStatus = (s: string) => {
    if (!railStatus || s === lastStatus) return
    lastStatus = s
    gsap.fromTo(railStatus, { opacity: 0 }, { opacity: 1, duration: 0.5 })
    railStatus.textContent = s
  }

  // chapter inspector-cards crossfade across the pinned stage
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate(self) {
        const idx = Math.min(n - 1, Math.floor(self.progress * n))
        if (counter) counter.textContent = String(idx + 1).padStart(2, '0')
        setStatus(HOPS[idx].status)
      },
      onLeaveBack: () => setStatus(WAYBILL_START),
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

  // camera film: begins while the hero scrolls out, ends with the pin.
  // Remapped so the camera FRAMES hop i while chapter i is centred on screen
  // (raw progress would put the camera one transit ahead of the copy).
  ScrollTrigger.create({
    trigger: track,
    start: 'top bottom',
    end: 'bottom bottom',
    scrub: true,
    onUpdate(self) {
      scrollState.film = Math.min(1, Math.max(0, self.progress * 1.19 - 0.09))
    },
  })

  // the film (and its dark vignette) fades to paper for the manifest,
  // then resumes for the finale
  gsap.to('#scene, .vignette', {
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.paper-zone', start: 'top 80%', end: 'top 20%', scrub: true },
  })
  gsap.fromTo(
    '#scene, .vignette',
    { opacity: 0 },
    {
      opacity: 1,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#contact', start: 'top 95%', end: 'top 35%', scrub: true },
    },
  )

  // waybill rail flips to paper styling over the interlude
  const rail = document.getElementById('order-rail')
  if (rail) {
    ScrollTrigger.create({
      trigger: '.paper-zone',
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => rail.classList.toggle('on-paper', self.isActive),
    })
  }

  // finale: descend over the city, mark the order delivered
  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top bottom',
    end: 'bottom bottom',
    scrub: true,
    onUpdate(self) {
      scrollState.finale = self.progress
      if (self.progress > 0.6) setStatus(WAYBILL_END)
      else if (self.progress > 0.05) setStatus('OUT FOR DELIVERY')
    },
  })

  // scroll cue disappears once the journey begins
  gsap.to('#scroll-cue', {
    autoAlpha: 0,
    scrollTrigger: { trigger: track, start: 'top 92%', end: 'top 70%', scrub: true },
  })

  // header progress line
  gsap.to('.scroll-progress span', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: true },
  })
}
