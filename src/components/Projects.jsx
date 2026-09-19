import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { PROJECTS, CONTACT } from '../data'
import styles from './Projects.module.css'

// 'left'  -> cards drift from right to left
// 'right' -> cards drift from left to right
const DIRECTION = 'left'

// Constant drift speed in pixels per second. Bigger = faster.
const SPEED = 40

// How long a swipe keeps gliding. Higher = the flick slows down sooner.
const FRICTION = 2

// Max glide speed (px/s) a hard flick can reach.
const MAX_FLICK = 4500

// Pixels the pointer must move before it counts as a drag (not a click).
const DRAG_THRESHOLD = 6

// Copies of the project list in EACH half of the loop. With only a few
// projects, 2 keeps the strip wider than any screen so there are no gaps.
const COPIES_PER_HALF = 2

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

// Shown when a project has no screenshot yet (or the image fails to load).
function CoverFallback({ id }) {
  return (
    <div className={styles.coverFallback}>
      <span>{`</${id}>`}</span>
    </div>
  )
}

function ProjectCover({ project }) {
  const [errored, setErrored] = useState(false)

  if (!project.image || errored) {
    return <CoverFallback id={project.id} />
  }

  return (
    <div className={styles.coverWrap}>
      <img
        src={project.image}
        alt={project.title}
        className={styles.cover}
        loading="lazy"
        decoding="async"
        draggable="false"
        onError={() => setErrored(true)}
      />
      <div className={styles.coverOverlay} />
      {project.live && (
        <span className={styles.liveTag}>
          <span className={styles.liveDot} />
          Live
        </span>
      )}
    </div>
  )
}

// `isClone` marks the duplicated cards that only exist to make the loop
// seamless: they are hidden from screen readers and skipped by Tab.
function ProjectCard({ project, isClone }) {
  const tabIndex = isClone ? -1 : undefined

  return (
    <article className={styles.card} aria-hidden={isClone || undefined}>
      {project.featured && <span className={styles.featuredBadge}>Featured</span>}

      <ProjectCover project={project} />

      <div className={styles.cardBody}>
        <span className={styles.num}># {project.id}</span>

        <h3 className={styles.projectTitle}>{project.title}</h3>
        <p className={styles.projectDesc}>{project.description}</p>

        <div className={styles.tags}>
          {project.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className={styles.actions}>
          {project.live ? (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.liveBtn}
              aria-label={`View ${project.title} live`}
              draggable="false"
              tabIndex={tabIndex}
            >
              View Live
              <ExternalIcon />
            </a>
          ) : (
            <span className={styles.liveBtnDisabled}>Live demo coming soon</span>
          )}

          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.codeBtn}
              aria-label={`${project.title} source code on GitHub`}
              draggable="false"
              tabIndex={tabIndex}
            >
              <GitHubIcon />
              Code
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

/*
  Drives the strip. It drifts at a constant speed, and the visitor can
  drag (mouse), swipe (touch) or two-finger scroll (trackpad) to move it
  themselves. Letting go after a flick keeps the strip gliding fast, then it
  eases back down to the normal drift speed. Hovering does NOT pause it.
*/
function useCarousel({ enabled }) {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    if (!enabled) return
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const drift = DIRECTION === 'right' ? SPEED : -SPEED
    const s = {
      x: 0, // current translateX of the track
      half: 0, // width of one half of the loop
      extra: 0, // extra glide speed from a flick (px/s)
      vel: 0, // smoothed finger speed while dragging (px/s)
      raf: 0,
      last: 0,
      pressed: false,
      dragging: false,
      suppressClick: false,
      focused: false,
      pointerId: null,
      startX: 0,
      lastX: 0,
      lastT: 0,
    }

    const apply = () => {
      track.style.transform = `translate3d(${s.x}px, 0, 0)`
    }

    // Keep x inside (-half, 0] so the loop wraps invisibly.
    const wrap = () => {
      if (!s.half) return
      s.x = s.x % s.half
      if (s.x > 0) s.x -= s.half
    }

    const measure = () => {
      s.half = track.scrollWidth / 2
      wrap()
      apply()
    }

    const tick = (now) => {
      const dt = Math.min((now - s.last) / 1000, 0.05)
      s.last = now

      if (!s.dragging) {
        s.extra *= Math.exp(-FRICTION * dt)
        if (Math.abs(s.extra) < 1) s.extra = 0
        const base = s.focused ? 0 : drift
        s.x += (base + s.extra) * dt
        wrap()
        apply()
      }
      s.raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (s.raf) return
      s.last = performance.now()
      s.raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(s.raf)
      s.raf = 0
    }

    // ---- Drag / swipe ----
    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      s.pressed = true
      s.suppressClick = false
      s.pointerId = e.pointerId
      s.startX = s.lastX = e.clientX
      s.lastT = performance.now()
      s.vel = 0
    }

    const onMove = (e) => {
      if (!s.pressed || e.pointerId !== s.pointerId) return

      if (!s.dragging) {
        if (Math.abs(e.clientX - s.startX) < DRAG_THRESHOLD) return
        s.dragging = true
        s.extra = 0
        viewport.setPointerCapture(e.pointerId)
        viewport.setAttribute('data-dragging', 'true')
      }

      const now = performance.now()
      const dx = e.clientX - s.lastX
      const dt = Math.max((now - s.lastT) / 1000, 0.001)
      s.vel = 0.75 * s.vel + 0.25 * (dx / dt)

      s.x += dx
      wrap()
      apply()
      s.lastX = e.clientX
      s.lastT = now
    }

    const onUp = (e) => {
      if (!s.pressed || e.pointerId !== s.pointerId) return
      s.pressed = false

      if (s.dragging) {
        s.dragging = false
        s.suppressClick = true // don't open a link at the end of a swipe
        viewport.removeAttribute('data-dragging')
        // If the finger rested before lifting, there is no flick.
        const idle = performance.now() - s.lastT
        s.extra = idle > 80 ? 0 : Math.max(-MAX_FLICK, Math.min(MAX_FLICK, s.vel))
        if (viewport.hasPointerCapture(e.pointerId)) {
          viewport.releasePointerCapture(e.pointerId)
        }
      }
    }

    const onClickCapture = (e) => {
      if (s.suppressClick) {
        e.preventDefault()
        e.stopPropagation()
        s.suppressClick = false
      }
    }

    // ---- Trackpad / horizontal wheel ----
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      s.x -= e.deltaX
      wrap()
      apply()
    }

    // ---- Keyboard: only pause the drift while tabbing through links ----
    const onFocusIn = (e) => {
      if (e.target.matches?.(':focus-visible')) s.focused = true
    }
    const onFocusOut = () => {
      s.focused = false
    }

    // Only animate while the strip is on screen.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    )
    io.observe(viewport)

    const ro = new ResizeObserver(measure)
    ro.observe(track)
    measure()

    viewport.addEventListener('pointerdown', onDown)
    viewport.addEventListener('pointermove', onMove)
    viewport.addEventListener('pointerup', onUp)
    viewport.addEventListener('pointercancel', onUp)
    viewport.addEventListener('click', onClickCapture, true)
    viewport.addEventListener('wheel', onWheel, { passive: false })
    viewport.addEventListener('focusin', onFocusIn)
    viewport.addEventListener('focusout', onFocusOut)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      viewport.removeEventListener('pointerdown', onDown)
      viewport.removeEventListener('pointermove', onMove)
      viewport.removeEventListener('pointerup', onUp)
      viewport.removeEventListener('pointercancel', onUp)
      viewport.removeEventListener('click', onClickCapture, true)
      viewport.removeEventListener('wheel', onWheel)
      viewport.removeEventListener('focusin', onFocusIn)
      viewport.removeEventListener('focusout', onFocusOut)
    }
  }, [enabled])

  return { viewportRef, trackRef }
}

export default function Projects() {
  const [ref, inView] = useInView()

  // Visitors who prefer reduced motion get a plain, natively scrollable row
  // instead of the auto-moving strip.
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const { viewportRef, trackRef } = useCarousel({ enabled: !reduced })

  // The track holds two identical halves; sliding by exactly one half looks
  // identical to the start, so the loop never visibly jumps.
  const half = Array.from({ length: COPIES_PER_HALF }, () => PROJECTS).flat()
  const loop = reduced ? PROJECTS : [...half, ...half]

  return (
    <section id="projects" className={styles.section} ref={ref}>
      <div className={styles.inner}>
        <motion.p
          className={styles.label}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          &gt; my_work
        </motion.p>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Projects
        </motion.h2>
        <div className={styles.divider} />
      </div>

      {/* Full-width strip, breaks out of the 1100px column like the tech timeline */}
      <motion.div
        ref={viewportRef}
        className={`${styles.viewport} ${reduced ? styles.reduced : ''}`}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div ref={trackRef} className={styles.track}>
          {loop.map((project, i) => (
            <ProjectCard
              key={`${project.id}-${i}`}
              project={project}
              isClone={i >= PROJECTS.length}
            />
          ))}
        </div>
      </motion.div>

      <p className={styles.hint}>Drag or swipe to browse</p>

      <div className={styles.inner}>
        <motion.div
          className={styles.moreWrap}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <a
            href={CONTACT.github}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.moreLink}
          >
            <GitHubIcon />
            See more on GitHub →
          </a>
        </motion.div>
      </div>
    </section>
  )
}