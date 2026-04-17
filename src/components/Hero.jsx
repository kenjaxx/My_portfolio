import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ParticlesBackground from './ParticlesBackground'
import { ROLES } from '../data'
import styles from './Hero.module.css'

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const current = ROLES[roleIndex]
    let timeout

    if (!deleting) {
      if (charIndex < current.length) {
        timeout = setTimeout(() => {
          setDisplayed(current.substring(0, charIndex + 1))
          setCharIndex(c => c + 1)
        }, 80)
      } else {
        timeout = setTimeout(() => setDeleting(true), 2000)
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayed(current.substring(0, charIndex - 1))
          setCharIndex(c => c - 1)
        }, 45)
      } else {
        setDeleting(false)
        setRoleIndex(r => (r + 1) % ROLES.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [charIndex, deleting, roleIndex])

  return (
    <section className={styles.hero}>
      <ParticlesBackground />

      <div className={styles.glowOrb1} />
      <div className={styles.glowOrb2} />

      <div className={styles.content}>
        <motion.p
          className={styles.greeting}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
           hello world! — i'm
        </motion.p>

        <motion.h1
          className={styles.name}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Kenji<br />
          <span className={styles.nameAccent}>Ermita</span>
        </motion.h1>

        <motion.div
          className={styles.roleWrap}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span className={styles.rolePrefix}>{'> '}</span>
          <span className={styles.role}>{displayed}</span>
          <span className={styles.cursor}>_</span>
        </motion.div>

        <motion.p
          className={styles.bio}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          Building pixel-perfect frontends & robust backends.<br />
          IT student. Problem solver. Code craftsman.
        </motion.p>

        <motion.div
          className={styles.buttons}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <button
            className={styles.btnPrimary}
            onClick={() => document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' })}
          >
            View My Work
            <span className={styles.btnArrow}>→</span>
          </button>
          <a
            href="https://github.com/kenjaxx"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnOutline}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </motion.div>

        <motion.div
          className={styles.scrollHint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className={styles.scrollLine} />
          <span>scroll</span>
        </motion.div>
      </div>
    </section>
  )
}
