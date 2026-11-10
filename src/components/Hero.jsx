import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { FaGithub } from 'react-icons/fa'
import RetroGrid from './RetroGrid'
import TechTimeline from './TechTimeline'
import SplitFlapText from './SplitFlapText'
import { CONTACT } from '../data'
import { getDeviceTier } from '../utils/deviceTier'
import { useHeroParallax } from '../hooks/useHeroParallax'
import styles from './Hero.module.css'

const NAME = 'Kenji Ermita'
const ROLE = 'Full Stack Developer'

// Font sizes that scale with the screen so the whole board always fits.
// Name: 12 tiles are about 10.56em wide, so size = (screen width - padding) / 10.8,
// capped at 108px. Role: 20 tiles are about 17.6em wide, capped at 34px.
const NAME_SIZE = 'min(108px, calc((100vw - 48px) / 10.8))'
const ROLE_SIZE = 'min(34px, calc((100vw - 48px) / 18.4))'

/* ---------- Entrance timing ----------
   Slow, heavy flips. Rough timeline:
     name board   0.35s -> about 3.3s
     role board   1.8s  -> about 3.9s
     buttons      3.2s
   For an even slower flip raise NAME_FLIP_SECONDS (0.28 is very dramatic) and
   push ROLE_DELAY_MS and CTA_DELAY_SECONDS back by the same amount. */
const NAME_FLIP_SECONDS = 0.22
const NAME_STAGGER_SECONDS = 0.09
const NAME_FLIPS_PER_CHAR = 8

const ROLE_FLIP_SECONDS = 0.16
const ROLE_STAGGER_SECONDS = 0.05
const ROLE_FLIPS_PER_CHAR = 6

const ROLE_DELAY_MS = 1800
const CTA_DELAY_SECONDS = 3.2

// Look shared by both boards. The cyan glow itself is in Hero.module.css.
// glare stays at 0 on purpose: it animates a gradient on every flap, which is
// repainted on the main thread and was a noticeable cost. depth 0.6 still gives
// the flaps a heavier shaded look while they turn.
const BOARD = {
  tileStyle: 'board',
  tileColor: '#0f1c2b',
  textColor: '#8ff0ff',
  gap: '0.1em',
  tileRadius: '0.12em',
  order: 'left',
  charset: 'alphanumeric',
  glare: 0,
  depth: 0.6,
  intro: true,
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

// Read once at module load.
const tier = getDeviceTier()

export default function Hero() {
  const [roleOn, setRoleOn] = useState(false)

  // Pointer parallax (grid + glow orbs). Only runs while the mouse is moving.
  const { sectionRef, gridRef, orbARef, orbBRef } = useHeroParallax()

  /* ---------- Scroll-linked exit ----------
     scrollYProgress is 0 while the hero fills the screen and 1 once it has
     scrolled out of view. Only transform and opacity are animated, and each
     moving element sits on its own compositor layer (will-change in the CSS),
     so the GPU just scales the already-painted name board and nothing inside
     it (the tiles, the glow, the reflection) is repainted while scrolling. */
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Name + role boards: shrink toward their own centre and fade out.
  const nameScale = useTransform(scrollYProgress, [0, 1], [1, 0.55])
  const nameOpacity = useTransform(scrollYProgress, [0.1, 0.65], [1, 0])

  const ctaY = useTransform(scrollYProgress, [0, 1], [0, -40])
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  const gridOpacity = useTransform(scrollYProgress, [0.5, 0.95], [1, 0])
  const cueOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  // Visitors who prefer reduced motion get a plain hero that just scrolls away.
  const onScroll = (values) => (reduceMotion ? undefined : values)

  useEffect(() => {
    const id = setTimeout(() => setRoleOn(true), ROLE_DELAY_MS)
    return () => clearTimeout(id)
  }, [])

  const scrollToProjects = () => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={sectionRef} className={`${styles.hero} ${tier.lowPower ? styles.lite : ''}`}>
      {/* Grid floor: gridLayer fades on scroll, gridShift slides with the
          pointer, RetroGrid is the WebGL shader (1x resolution, 30fps cap). */}
      <motion.div className={styles.gridLayer} style={onScroll({ opacity: gridOpacity })}>
        <div ref={gridRef} className={styles.gridShift}>
          <RetroGrid
            angle={65}
            cellSize={60}
            opacity={0.4}
            lineColor="rgba(0, 212, 255, 0.55)"
            maxPixelRatio={tier.lowPower ? 0.75 : 1}
            maxFps={30}
          />
        </div>
      </motion.div>

      <div ref={orbARef} className={styles.glowOrb1}></div>
      <div ref={orbBRef} className={styles.glowOrb2}></div>

      {/* No scroll effect on the skills strip: it is already animating on its
          own, and adding more on top of it made scrolling heavier. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <TechTimeline />
      </motion.div>

      <div className={styles.inner}>
        <div className={styles.center}>
          {/* The real heading for screen readers and search engines. The two
              boards below are decoration, so they are hidden from assistive tech. */}
          <h1 className={styles.srOnly}>
            {NAME} – {ROLE}
          </h1>

          {/* scrollLayer writes the scroll exit; stack writes the entrance.
              They are separate elements so the two transforms never fight. */}
          <motion.div
            className={styles.scrollLayer}
            style={onScroll({ scale: nameScale, opacity: nameOpacity })}
          >
            <motion.div
              className={styles.stack}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              aria-hidden="true"
            >
              {/* Small role board above the name. The slot keeps its height
                  while the board waits to start, so nothing jumps. */}
              <div
                className={`${styles.roleSlot} ${styles.board}`}
                style={{ fontSize: ROLE_SIZE }}
              >
                {roleOn && (
                  <SplitFlapText
                    {...BOARD}
                    text={ROLE.toUpperCase()}
                    padTo={ROLE.length}
                    fontSize={ROLE_SIZE}
                    flipDuration={ROLE_FLIP_SECONDS}
                    stagger={ROLE_STAGGER_SECONDS}
                    flipsPerChar={ROLE_FLIPS_PER_CHAR}
                  />
                )}
              </div>

              {/* Big name board. The soft mirror image underneath is a CSS
                  reflection (see .nameBoard), so it always matches the board. */}
              <div className={`${styles.nameBoard} ${styles.board}`}>
                <SplitFlapText
                  {...BOARD}
                  text={NAME.toUpperCase()}
                  padTo={NAME.length}
                  fontSize={NAME_SIZE}
                  flipDuration={NAME_FLIP_SECONDS}
                  stagger={NAME_STAGGER_SECONDS}
                  flipsPerChar={NAME_FLIPS_PER_CHAR}
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.ctaLayer}
            style={onScroll({ y: ctaY, opacity: ctaOpacity })}
          >
            <motion.div
              className={styles.ctaRow}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: CTA_DELAY_SECONDS, duration: 0.6 }}
            >
              <button
                type="button"
                className="glass-btn glass-btn--accent"
                onClick={scrollToProjects}
              >
                View My Work
                <span className="glass-btn__arrow" aria-hidden="true">
                  →
                </span>
              </button>

              <a href={CONTACT.resume} download className="glass-btn glass-btn--sm">
                <DownloadIcon /> Resume
              </a>

              <a
                href={CONTACT.github}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-btn glass-btn--sm"
              >
                <FaGithub size={15} aria-hidden="true" /> GitHub
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative scroll cue, fades out on the first bit of scrolling. */}
      <motion.div
        className={styles.scrollCue}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: CTA_DELAY_SECONDS + 0.4, duration: 0.6 }}
      >
        <motion.div style={onScroll({ opacity: cueOpacity })}>
          <span className={styles.cueMouse}>
            <span className={styles.cueDot} />
          </span>
        </motion.div>
      </motion.div>
    </section>
  )
}