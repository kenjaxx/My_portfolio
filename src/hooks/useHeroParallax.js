import { useEffect, useRef } from 'react'
import { getDeviceTier } from '../utils/deviceTier'

/*
  Pointer parallax for the hero (lightweight version).

  Returns refs for the section and the layers that move:
    sectionRef  the <section> (the pointer is tracked over it)
    gridRef     wrapper around <RetroGrid />   slides sideways
    orbARef     purple glow orb                drifts against the cursor
    orbBRef     cyan glow orb                  drifts with the cursor

  Performance rules this hook follows:
    - No always-on loop. A requestAnimationFrame loop only runs while the
      layers are still catching up with the cursor, then it stops by itself.
      A still mouse, or scrolling with the mouse over the hero, costs nothing.
    - Only transforms are written (compositor-friendly), straight to
      element.style, so React never re-renders.
    - The name board is NOT moved here any more. It has a CSS reflection, and
      transforming something with a reflection every frame is expensive.

  Skipped entirely when the visitor prefers reduced motion, the device has no
  fine pointer (phones, tablets), or getDeviceTier() says low-power.
*/

const GRID_SHIFT_X = 22 // px at full deflection
const ORB_A = { x: 28, y: 16 } // px, moves against the cursor
const ORB_B = { x: 22, y: 12 } // px, moves with the cursor
const EASE = 0.1 // 0 to 1, lower = floatier
const SETTLE = 0.001 // stop the loop when this close to the target

export function useHeroParallax() {
  const sectionRef = useRef(null)
  const gridRef = useRef(null)
  const orbARef = useRef(null)
  const orbBRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (reduce.matches || !finePointer.matches || getDeviceTier().lowPower) return undefined

    const grid = gridRef.current
    const orbA = orbARef.current
    const orbB = orbBRef.current

    const target = { x: 0, y: 0 } // -1 to 1
    const now = { x: 0, y: 0 }
    let visible = true
    let raf = 0

    const write = () => {
      const { x, y } = now
      if (grid) grid.style.transform = `translate3d(${(-x * GRID_SHIFT_X).toFixed(1)}px, 0, 0)`
      if (orbA) {
        orbA.style.transform = `translate3d(${(-x * ORB_A.x).toFixed(1)}px, ${(-y * ORB_A.y).toFixed(1)}px, 0)`
      }
      if (orbB) {
        orbB.style.transform = `translate3d(${(x * ORB_B.x).toFixed(1)}px, ${(y * ORB_B.y).toFixed(1)}px, 0)`
      }
    }

    const frame = () => {
      raf = 0
      if (!visible || document.hidden) return

      now.x += (target.x - now.x) * EASE
      now.y += (target.y - now.y) * EASE

      const settled =
        Math.abs(target.x - now.x) < SETTLE && Math.abs(target.y - now.y) < SETTLE
      if (settled) {
        now.x = target.x
        now.y = target.y
      }
      write()

      if (!settled) raf = requestAnimationFrame(frame)
    }

    const wake = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame)
    }

    const onMove = (event) => {
      if (event.pointerType !== 'mouse') return
      const rect = section.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
      wake()
    }

    const onLeave = () => {
      target.x = 0
      target.y = 0
      wake()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (!visible) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    })
    io.observe(section)

    section.addEventListener('pointermove', onMove, { passive: true })
    section.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
      for (const el of [grid, orbA, orbB]) {
        if (el) el.style.transform = ''
      }
    }
  }, [])

  return { sectionRef, gridRef, orbARef, orbBRef }
}