import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaGithub } from 'react-icons/fa'
import RetroGrid from './RetroGrid'
import TechTimeline from './TechTimeline'
import SplitFlapText from './SplitFlapText'
import { CONTACT } from '../data'
import { getDeviceTier } from '../utils/deviceTier'
import styles from './Hero.module.css'

const NAME = 'Kenji Ermita'
const ROLE = 'Full Stack Developer'

// Font sizes that scale with the screen so the whole board always fits.
// Name: 12 tiles are about 10.56em wide, so size = (screen width - padding) / 10.8,
// capped at 108px. Role: 20 tiles are about 17.6em wide, capped at 34px.
const NAME_SIZE = 'min(108px, calc((100vw - 48px) / 10.8))'
const ROLE_SIZE = 'min(34px, calc((100vw - 48px) / 18.4))'

// The role board starts flipping a moment after the name, so the two
// animations play one after the other instead of at the same time.
const ROLE_DELAY_MS = 900

// Look shared by both boards. The cyan glow itself is in Hero.module.css.
const BOARD = {
  tileStyle: 'board',
  tileColor: '#0f1c2b',
  textColor: '#8ff0ff',
  gap: '0.1em',
  tileRadius: '0.12em',
  flipDuration: 0.1,
  stagger: 0.04,
  flipsPerChar: 6,
  order: 'left',
  charset: 'alphanumeric',
  glare: 0,
  depth: 0.5,
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

  useEffect(() => {
    const id = setTimeout(() => setRoleOn(true), ROLE_DELAY_MS)
    return () => clearTimeout(id)
  }, [])

  const scrollToProjects = () => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className={`${styles.hero} ${tier.lowPower ? styles.lite : ''}`}>
      {/* The grid floor is a faint, slow-moving background, so it is drawn at
          1x resolution (0.75x on weak devices) and capped at 30fps. */}
      <RetroGrid
        angle={65}
        cellSize={60}
        opacity={0.4}
        lineColor="rgba(0, 212, 255, 0.55)"
        maxPixelRatio={tier.lowPower ? 0.75 : 1}
        maxFps={30}
      />
      <div className={styles.glowOrb1}></div>
      <div className={styles.glowOrb2}></div>

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

          <motion.div
            className={styles.stack}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            aria-hidden="true"
          >
            {/* Small role board above the name. The slot keeps its height
                while the board waits to start, so nothing jumps. */}
            <div className={`${styles.roleSlot} ${styles.board}`} style={{ fontSize: ROLE_SIZE }}>
              {roleOn && (
                <SplitFlapText
                  {...BOARD}
                  text={ROLE.toUpperCase()}
                  padTo={ROLE.length}
                  fontSize={ROLE_SIZE}
                  flipsPerChar={4}
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
              />
            </div>
          </motion.div>

          <motion.div
            className={styles.ctaRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <button type="button" className="glass-btn glass-btn--accent" onClick={scrollToProjects}>
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
        </div>
      </div>
    </section>
  )
}