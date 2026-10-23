import { useEffect } from 'react'

// Sections count as "on screen" a little before they actually enter the
// viewport, so animations are already running when you scroll to them.
const MARGIN = '200px 0px'

/*
  Marks every section that is scrolled out of view with a `data-offscreen`
  attribute. index.css has one rule that pauses all CSS animations inside an
  element carrying that attribute (the blinking cursor, the shine on the About
  heading, the glow pulses, and so on).

  Why: an infinite CSS animation keeps asking the browser to restyle and repaint
  its element every frame, even when the element can't be seen. Pausing them
  off-screen costs nothing visually and removes that work.
*/
export function usePauseOffscreen(selector = 'main > section') {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll(selector))
    if (sections.length === 0 || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting)
        }
      },
      { rootMargin: MARGIN }
    )

    sections.forEach((section) => observer.observe(section))

    return () => {
      observer.disconnect()
      sections.forEach((section) => section.removeAttribute('data-offscreen'))
    }
  }, [selector])
}