import { useEffect, useRef } from 'react'

const MAX_PARTICLES = 90 // caps the O(n²) connection-line check so large screens stay smooth

export default function ParticlesBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Skip the animation entirely for users who prefer reduced motion.
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    const ctx = canvas.getContext('2d')
    let animId
    let pts = []
    let isVisible = true

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      initPts()
    }

    const initPts = () => {
      const n = Math.min(
        MAX_PARTICLES,
        Math.floor((canvas.width * canvas.height) / 10000)
      )
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.5 + 0.5,
      }))
    }

    const draw = () => {
      // Bail out of the render loop (no rAF re-queue) once the canvas has
      // scrolled off-screen — no point burning CPU/battery animating
      // particles nobody can see.
      if (!isVisible) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const W = canvas.width
      const H = canvas.height

      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        // Dimmed from 0.55 -> 0.35 so the field sits behind the hero's
        // terminal panel instead of competing with it.
        ctx.fillStyle = 'rgba(0, 212, 255, 0.35)'
        ctx.fill()
      }

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 130) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            // Dimmed from 0.12 -> 0.08 to match the fainter dots above.
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 * (1 - d / 130)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Pause/resume the rAF loop based on viewport visibility of the canvas itself.
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible) {
          cancelAnimationFrame(animId)
          draw()
        }
      },
      { threshold: 0 }
    )
    io.observe(canvas)

    // Also pause when the browser tab itself is hidden (another tab/app in focus).
    const onVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false
      } else {
        io.takeRecords()
        isVisible = canvas.getBoundingClientRect().top < window.innerHeight
        if (isVisible) {
          cancelAnimationFrame(animId)
          draw()
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}