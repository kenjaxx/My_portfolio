import { useEffect } from 'react'

// How far (px) from a button the cursor starts to pull its light toward it.
const RANGE = 220

// While the mouse keeps moving, button positions are re-read at most this
// often (ms). Scroll, resize and layout changes also trigger a re-read.
const REMEASURE_MS = 250

const SELECTOR = '.glass-btn'

/*
  Drives the light on every `.glass-btn` with one shared pointer listener.

  For each button near the cursor it sets three CSS variables:
    --gx, --gy  cursor position in px, relative to the button
    --gi        0 to 1, how close the cursor is (the light grows with it)
  Buttons that are out of range get the variables removed, so the light eases
  back to its idle corners (the transitions live in index.css).

  Performance design:
    - Only buttons within RANGE of the viewport are tracked (IntersectionObserver).
    - Button positions are read in ONE batch and cached. A plain mouse move
      does no layout reads at all, only arithmetic plus a few style writes.
      Reads and writes are never interleaved, so there is no layout thrashing.
    - A MutationObserver picks up buttons that appear later (popups, etc.).

  Skipped on touch devices, where there is no cursor to follow.
*/
export function useGlassButtons() {
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!mq.matches) return undefined

    const known = new Set() // every .glass-btn currently in the document
    const visible = new Map() // near-viewport buttons -> cached rect (or null)
    const lit = new Set() // buttons that currently have the CSS variables set

    let raf = 0
    let scanRaf = 0
    let px = 0
    let py = 0
    let active = false
    let dirty = true // positions need re-reading
    let measuredAt = 0

    const clear = (el) => {
      el.style.removeProperty('--gx')
      el.style.removeProperty('--gy')
      el.style.removeProperty('--gi')
      lit.delete(el)
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    // Only buttons that are on (or just outside) the screen are worth tracking.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target, null)
          } else {
            visible.delete(entry.target)
            if (lit.has(entry.target)) clear(entry.target)
          }
        }
        dirty = true
        if (active) schedule()
      },
      { rootMargin: `${RANGE}px` }
    )

    // Finds buttons that were added or removed since the last scan.
    const scan = () => {
      scanRaf = 0
      const found = new Set(document.querySelectorAll(SELECTOR))

      found.forEach((el) => {
        if (!known.has(el)) {
          known.add(el)
          io.observe(el)
        }
      })

      known.forEach((el) => {
        if (!found.has(el)) {
          known.delete(el)
          visible.delete(el)
          lit.delete(el)
          io.unobserve(el)
        }
      })

      dirty = true
    }

    const queueScan = () => {
      if (!scanRaf) scanRaf = requestAnimationFrame(scan)
    }

    const touchesButtons = (node) =>
      node.nodeType === 1 && (node.matches(SELECTOR) || node.querySelector(SELECTOR) !== null)

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (touchesButtons(node)) return queueScan()
        }
        for (const node of record.removedNodes) {
          if (touchesButtons(node)) return queueScan()
        }
      }
      return undefined
    })

    // All the reads happen here, together, so the browser lays out once.
    const measure = (now) => {
      visible.forEach((_, el) => {
        visible.set(el, el.getBoundingClientRect())
      })
      dirty = false
      measuredAt = now
    }

    function update() {
      raf = 0

      if (!active) {
        lit.forEach(clear)
        return
      }

      const now = performance.now()
      if (dirty || now - measuredAt > REMEASURE_MS) measure(now)

      // Writes only, from here on.
      visible.forEach((rect, el) => {
        if (!rect) return

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

    // Scrolling moves buttons under a still cursor, and changes their rects.
    const onScroll = () => {
      dirty = true
      if (active) schedule()
    }

    const onResize = () => {
      dirty = true
      if (active) schedule()
    }

    scan()
    mo.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(scanRaf)
      io.disconnect()
      mo.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      lit.forEach(clear)
      known.clear()
      visible.clear()
    }
  }, [])
}