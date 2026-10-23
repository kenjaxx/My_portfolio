import { useEffect } from 'react'

// How far (px) from a button the cursor starts to pull its light toward it.
const RANGE = 300

/*
  Drives the light on every `.glass-btn` with one shared pointer listener.

  For each button near the cursor it sets three CSS variables:
    --gx, --gy  cursor position in px, relative to the button
    --gi        0 to 1, how close the cursor is (the light grows with it)
  Buttons that are out of range get the variables removed, so the light eases
  back to its idle corners (the transitions live in index.css).

  Skipped on touch devices, where there is no cursor to follow.
*/
export function useGlassButtons() {
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!mq.matches) return undefined

    const lit = new Set()
    let raf = 0
    let px = 0
    let py = 0
    let active = false

    const clear = (el) => {
      el.style.removeProperty('--gx')
      el.style.removeProperty('--gy')
      el.style.removeProperty('--gi')
      lit.delete(el)
    }

    const update = () => {
      raf = 0

      if (!active) {
        lit.forEach(clear)
        return
      }

      document.querySelectorAll('.glass-btn').forEach((el) => {
        const rect = el.getBoundingClientRect()
        const dx = Math.max(rect.left - px, 0, px - rect.right)
        const dy = Math.max(rect.top - py, 0, py - rect.bottom)
        const t = Math.min(Math.max(1 - Math.hypot(dx, dy) / RANGE, 0), 1)

        if (t > 0) {
          const near = t * t * (3 - 2 * t)
          el.style.setProperty('--gx', `${(px - rect.left).toFixed(1)}px`)
          el.style.setProperty('--gy', `${(py - rect.top).toFixed(1)}px`)
          el.style.setProperty('--gi', near.toFixed(3))
          lit.add(el)
        } else if (lit.has(el)) {
          clear(el)
        }
      })
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    const onMove = (event) => {
      if (event.pointerType !== 'mouse') return
      px = event.clientX
      py = event.clientY
      active = true
      schedule()
    }

    const onLeave = () => {
      active = false
      schedule()
    }

    // Scrolling moves buttons under a still cursor.
    const onScroll = () => {
      if (active) schedule()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      lit.forEach(clear)
    }
  }, [])
}