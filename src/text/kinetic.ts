import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export function initKinetic() {
  // hero wordmark: chars rise out of a masked line
  const heroSplit = new SplitText('.hero-wordmark', { type: 'chars' })
  gsap.set('.hero-wordmark', { overflow: 'hidden' })
  gsap.from(heroSplit.chars, {
    yPercent: 115,
    stagger: 0.035,
    duration: 1.2,
    ease: 'expo.out',
    delay: 0.2,
    onComplete: () => heroSplit.revert(),
  })
  // NOTE: .order-rail / .scroll-cue are fixed chrome with their own CSS
  // entrance — animating them here collides with their CSS opacity transition
  gsap.from('.hero-kicker, .hero-thesis, .hero-stats, .hero-card', {
    autoAlpha: 0,
    y: 26,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.7,
  })

  // section titles: word-level rise on entry
  document.querySelectorAll<HTMLElement>('.section-title').forEach((el) => {
    const split = new SplitText(el, { type: 'words' })
    gsap.from(split.words, {
      yPercent: 110,
      autoAlpha: 0,
      stagger: 0.05,
      duration: 0.8,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 86%' },
    })
  })

  // the DELIVERED stamp slams in
  const delivered = document.querySelector<HTMLElement>('.delivered-word')
  if (delivered) {
    gsap.from(delivered, {
      scale: 1.6,
      autoAlpha: 0,
      duration: 0.55,
      ease: 'power4.in',
      scrollTrigger: { trigger: delivered, start: 'top 75%' },
    })
  }

  // cards, manifest groups and archive rows stagger in
  const items = gsap.utils.toArray<HTMLElement>(
    '.card, .manifest-group, .archive-list li, .about-cols p',
  )
  gsap.set(items, { autoAlpha: 0, y: 34 })
  ScrollTrigger.batch(items, {
    start: 'top 92%',
    once: true,
    onEnter: (els) =>
      gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.75, ease: 'power3.out' }),
  })

  // contact block
  gsap.from('.contact-actions .btn, .delivered-sub', {
    autoAlpha: 0,
    y: 24,
    stagger: 0.08,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-actions', start: 'top 90%' },
  })
}
