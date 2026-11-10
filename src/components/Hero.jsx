import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import RetroGrid from './RetroGrid'
import TechTimeline from './TechTimeline'
import SplitFlapText from './SplitFlapText'
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
   Fewer flips per character than before (every flip step is a React state
   update plus new DOM for the flaps, so this is the main saving during the
   intro). Rough timeline:
     name board   0.35s -> about 3.0s
     role board   1.6s  -> about 3.4s
     reflection   fades in at 3.2s, after the name has settled
     scroll cue   3.4s
*/
const NAME_FLIP_SECONDS = 0.2
const NAME_STAGGER_SECONDS = 0.09
const NAME_FLIPS_PER_CHAR = 5

const ROLE_FLIP_SECONDS = 0.15
const ROLE_STAGGER_SECONDS = 0.05
const ROLE_FLIPS_PER_CHAR = 4

const ROLE_DELAY_MS = 1600
const REFLECT_DELAY_MS = 3200
const CUE_DELAY_SECONDS = 3.4

// Look shared by both boards. The cyan glow itself is in Hero.module.css.
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

// Read once at module load.
const tier = getDeviceTier()

/* ---------- Static reflection ----------
   A mirrored, non-animated copy of the name tiles. It is plain DOM (no
   animation, no canvas, no live copy of the flip board), so after it has been
   painted once it costs nothing, unlike -webkit-box-reflect, which re-drew the
   whole board on every frame. It fades in once the flip has finished. */
function Reflection({ text, on }) {
  const chars = text.toUpperCase().split('')

  return (
    <div className={`${styles.reflection} ${on ? styles.reflectionOn : ''}`} aria-hidden="true">
      <div className={styles.reflectionRow}>
        {chars.map((char, i) => (
          <span key={i} className={styles.rTile}>
            <span className={styles.rChar}>{char === ' ' ? '' : char}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Hero() {
  const [roleOn, setRoleOn] = useState(false)
  const [reflectOn, setReflectOn] = useState(false)
  // The WebGL grid only runs while the hero is on (or near) the screen.
  const [gridOn, setGridOn] = useState(true)

  // Pointer parallax (grid + glow orbs). Only runs while the mouse is moving.
  const { sectionRef, gridRef, orbARef, orbBRef } = useHeroParallax()

  /* ---------- Scroll-linked exit ----------
     scrollYProgress is 0 while the hero fills the screen and 1 once it has
     scrolled out of view. Only transform and opacity are animated, and each
     moving element sits on its own compositor layer (will-change in the CSS). */
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Name + role boards: shrink toward their own centre and fade out.
  const nameScale = useTransform(scrollYProgress, [0, 1], [1, 0.55])
  const nameOpacity = useTransform(scrollYProgress, [0.1, 0.65], [1, 0])

  const gridOpacity = useTransform(scrollYProgress, [0.5, 0.95], [1, 0])
  const cueOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  // Visitors who prefer reduced motion get a plain hero that just scrolls away.
  const onScroll = (values) => (reduceMotion ? undefined : values)

  useEffect(() => {
    const roleId = setTimeout(() => setRoleOn(true), ROLE_DELAY_MS)
    const reflectId = setTimeout(() => setReflectOn(true), REFLECT_DELAY_MS)
    return () => {
      clearTimeout(roleId)
      clearTimeout(reflectId)
    }
  }, [])

  // Unmount the WebGL grid when the hero is well out of view (it is already
  // faded to nothing by then), and bring it back when the visitor returns.
  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(([entry]) => setGridOn(entry.isIntersecting), {
      rootMargin: '300px 0px',
    })
    observer.observe(section)
    return () => observer.disconnect()
  }, [sectionRef])

  return (
    <section ref={sectionRef} className={`${styles.hero} ${tier.lowPower ? styles.lite : ''}`}>
      {/* Grid floor: gridLayer fades on scroll, gridShift slides with the
          pointer, RetroGrid is the WebGL shader (lower resolution and a
          24fps cap, since the lines are soft anyway). */}
      <motion.div className={styles.gridLayer} style={onScroll({ opacity: gridOpacity })}>
        <div ref={gridRef} className={styles.gridShift}>
          {gridOn && (
            <RetroGrid
              angle={65}
              cellSize={60}
              opacity={0.4}
              lineColor="rgba(0, 212, 255, 0.55)"
              maxPixelRatio={0.75}
              maxFps={tier.lowPower ? 20 : 24}
            />
          )}
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

              {/* Big name board. The font size on this wrapper is only used for
                  the em-based spacing and the reflection; the board itself
                  sets its own size. */}
              <div className={`${styles.nameBoard} ${styles.board}`} style={{ fontSize: NAME_SIZE }}>
                <SplitFlapText
                  {...BOARD}
                  text={NAME.toUpperCase()}
                  padTo={NAME.length}
                  fontSize={NAME_SIZE}
                  flipDuration={NAME_FLIP_SECONDS}
                  stagger={NAME_STAGGER_SECONDS}
                  flipsPerChar={NAME_FLIPS_PER_CHAR}
                />

                <Reflection text={NAME} on={reflectOn} />
              </div>
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
        transition={{ delay: CUE_DELAY_SECONDS, duration: 0.6 }}
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