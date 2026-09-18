import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ParticlesBackground from './ParticlesBackground'
import TechTimeline from './TechTimeline'
import { ROLES, CONTACT } from '../data'
import styles from './Hero.module.css'

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

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
          setCharIndex((c) => c + 1)
        }, 80)
      } else {
        timeout = setTimeout(() => setDeleting(true), 2000)
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayed(current.substring(0, charIndex - 1))
          setCharIndex((c) => c - 1)
        }, 45)
      } else {
        setDeleting(false)
        setRoleIndex((r) => (r + 1) % ROLES.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [charIndex, deleting, roleIndex])

  const scrollToProjects = () => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className={styles.hero}>
      <ParticlesBackground />
      <div className={styles.glowOrb1}></div>
      <div className={styles.glowOrb2}></div>

      <div className={styles.inner}>
        <div className={styles.left}>
          <motion.div
            className={styles.tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className={styles.tabDot} />
            hello_world.js
          </motion.div>

          <motion.h1
            className={styles.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            Kenji
            <br />
            <span className={styles.nameAccent}>Ermita</span>
          </motion.h1>

          <motion.div
            className={styles.roleBlock}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className={styles.roleCmd}>
              <span className={styles.prompt}>$ </span>role --current
            </p>
            <p className={styles.roleOut}>
              <span className={styles.roleVal}>{displayed}</span>
              <span className={styles.cursor}>▌</span>
            </p>
          </motion.div>

          <motion.p
            className={styles.bio}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Full Stack Developer building pixel-perfect frontends &amp; robust backends —
            currently open to freelance, internship, and collab work.
          </motion.p>

          <motion.div
            className={styles.ctaRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <button className={styles.btnPrimary} onClick={scrollToProjects}>
              View My Work
              <span className={styles.btnArrow}>→</span>
            </button>

            <a href={CONTACT.resume} download className={styles.textLink}>
              <DownloadIcon /> Resume
            </a>

            <a
              href="https://github.com/kenjaxx"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.textLink}
            >
              <GitHubIcon /> GitHub
            </a>
          </motion.div>
        </div>

        <motion.div
          className={styles.right}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
        >
          <div className={styles.terminal}>
            <div className={styles.termHeader}>
              <span className={styles.dot} style={{ background: '#ff5f57' }} />
              <span className={styles.dot} style={{ background: '#febc2e' }} />
              <span className={styles.dot} style={{ background: '#28c840' }} />
              <span className={styles.termTitle}>status.sh</span>
            </div>
            <div className={styles.termBody}>
              <p>
                <span className={styles.prompt}>$ </span>
                <span className={styles.cmd}>whoami</span>
              </p>
              <p className={styles.out}>kenji_ermita.dev</p>
              <p>
                <span className={styles.prompt}>$ </span>
                <span className={styles.cmd}>cat status.json</span>
              </p>
              <p className={styles.out}>{'{'}</p>
              <p className={styles.out}>
                &nbsp;&nbsp;"status": <span className={styles.green}>"accepting_new_projects"</span>,
              </p>
              <p className={styles.out}>&nbsp;&nbsp;"reply_time": "&lt; 24h",</p>
              <p className={styles.out}>&nbsp;&nbsp;"timezone": "GMT+8"</p>
              <p className={styles.out}>{'}'}</p>
              <p className={styles.statusLine}>
                <span className={styles.prompt}>$ </span>
                <span className={styles.statusDot} />
                available_for_work
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.6 }}
      >
        <TechTimeline />
      </motion.div>
    </section>
  )
}