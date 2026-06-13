import gsap from 'gsap'

/**
 * Stagger fade-in animation for all elements matching `selector`.
 * Elements animate from opacity:0 / y:30 to opacity:1 / y:0.
 */
export function staggerFadeIn(selector: string, delay = 0): void {
  const elements = document.querySelectorAll<HTMLElement>(selector)
  if (!elements.length) return

  gsap.fromTo(
    elements,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.1,
      delay,
    }
  )
}

/**
 * Continuous floating animation (yoyo) on a single element.
 * Moves element up 10px and back in a smooth sine wave.
 */
export function floatAnimation(element: Element): gsap.core.Tween {
  return gsap.to(element, {
    y: -10,
    duration: 3,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })
}

/**
 * Pulsing glow effect using box-shadow scale animation.
 * @param color - CSS rgba string for the glow color (defaults to blue)
 */
export function glowPulse(element: Element, color = 'rgba(59,130,246,0.5)'): gsap.core.Timeline {
  const tl = gsap.timeline({ repeat: -1, yoyo: true })

  tl.to(element, {
    boxShadow: `0 0 30px ${color}, 0 0 60px ${color.replace('0.5', '0.25')}`,
    scale: 1.03,
    duration: 1.5,
    ease: 'sine.inOut',
  }).to(element, {
    boxShadow: `0 0 10px ${color.replace('0.5', '0.15')}`,
    scale: 1,
    duration: 1.5,
    ease: 'sine.inOut',
  })

  return tl
}

/**
 * Reveal elements matching `selector` as they enter the viewport.
 * Uses IntersectionObserver — no GSAP ScrollTrigger dependency.
 * Elements should have CSS transition or GSAP will animate them on reveal.
 */
export function revealOnScroll(selector: string): () => void {
  const elements = document.querySelectorAll<HTMLElement>(selector)
  if (!elements.length) return () => {}

  // Set initial hidden state
  elements.forEach((el) => {
    gsap.set(el, { opacity: 0, y: 40 })
  })

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
          })
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )

  elements.forEach((el) => observer.observe(el))

  // Return cleanup function
  return () => observer.disconnect()
}

/**
 * Animates the textContent of an element from `from` to `to` as a counter.
 * Useful for statistics / hero number animations.
 */
export function counterAnimation(
  element: Element,
  from: number,
  to: number,
  duration = 2
): gsap.core.Tween {
  const obj = { value: from }

  return gsap.to(obj, {
    value: to,
    duration,
    ease: 'power1.out',
    onUpdate() {
      const current = Math.round(obj.value)
      element.textContent = current.toLocaleString()
    },
    onComplete() {
      element.textContent = to.toLocaleString()
    },
  })
}
