import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export function initKinetic() {
  // hero headline: chars rise out of masked lines
  const heroSplit = new SplitText('.hero-title .line', { type: 'chars' })
  gsap.from(heroSplit.chars, {
    yPercent: 115,
    stagger: 0.018,
    duration: 1.15,
    ease: 'expo.out',
    delay: 0.15,
    // restore natural text flow so lines re-wrap correctly on resize
    onComplete: () => heroSplit.revert(),
  })
  gsap.from('.hero-id, .hero-sub, .hero-stats, .hero-hint', {
    autoAlpha: 0,
    y: 26,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.55,
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

  // cards, manifest groups and archive rows stagger in
  const items = gsap.utils.toArray<HTMLElement>('.card, .manifest-group, .archive-list li, .about-cols p')
  gsap.set(items, { autoAlpha: 0, y: 34 })
  ScrollTrigger.batch(items, {
    start: 'top 92%',
    once: true,
    onEnter: (els) =>
      gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.75, ease: 'power3.out' }),
  })

  // contact block
  gsap.from('.contact-actions .btn', {
    autoAlpha: 0,
    y: 24,
    stagger: 0.08,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-actions', start: 'top 90%' },
  })
}
