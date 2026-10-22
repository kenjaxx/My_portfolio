import { motion } from 'framer-motion'
import { FaGithub } from 'react-icons/fa'
import RetroGrid from './RetroGrid'
import TechTimeline from './TechTimeline'
import ParticleText from './ParticleText'
import RotatingText from './RotatingText'
import { ROLES, CONTACT } from '../data'
import { getDeviceTier } from '../utils/deviceTier'
import styles from './Hero.module.css'

const NAME = 'Kenji Ermita'

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
  const scrollToProjects = () => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className={styles.hero}>
      <RetroGrid
        angle={65}
        cellSize={60}
        opacity={0.4}
        lineColor="rgba(0, 212, 255, 0.55)"
        maxPixelRatio={tier.lowPower ? 1 : 2}
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
          <motion.div
            className={styles.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            {/* The real heading. It is plain visible text, so it shows right away
                (before the font loads and the particles are sampled) and it stays
                available to screen readers and search engines. Once the particle
                canvas has drawn, CSS fades it out so the two never overlap. */}
            <h1 className={styles.nameText}>{NAME}</h1>

            <div className={styles.particles} aria-hidden="true">
              <ParticleText
                text={NAME}
                fontFamily="Rajdhani"
                fontWeight={700}
                fontSize="clamp(3.5rem, 11vw, 8rem)"
                color="#ffffff"
                highlightColor="#00d4ff"
                highlightMode="motion"
                shape="circle"
                intro="gather"
                scatter={180}
                gatherDuration={1600}
                stagger={420}
                particleSize={2}
                density={tier.lowPower ? 6 : 4}
                maxParticles={tier.lowPower ? 1100 : 5200}
                clickBurst
                burstStrength={1}
                pointerRepel={tier.coarse ? 0 : 40}
                repelRadius={120}
                idleDrift={tier.lowPower ? 0 : 0.7}
                trigger="mount"
                glow={!tier.lowPower}
              />
            </div>
          </motion.div>

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
              <RotatingText
                texts={ROLES}
                effect="slide"
                direction="up"
                staggerFrom="first"
                staggerDuration={0.03}
                rotationInterval={2500}
                mainClassName={styles.roleVal}
                splitLevelClassName={styles.roleWord}
              />
              <span className={styles.cursor} aria-hidden="true">
                ▌
              </span>
            </p>
          </motion.div>

          <motion.p
            className={styles.bio}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Full Stack Developer building pixel-perfect frontends &amp; robust backends — currently
            open to freelance, internship, and collab work.
          </motion.p>

          <motion.div
            className={styles.ctaRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <button className={styles.btnPrimary} onClick={scrollToProjects}>
              View My Work
              <span className={styles.btnArrow} aria-hidden="true">
                →
              </span>
            </button>

            <a href={CONTACT.resume} download className={styles.textLink}>
              <DownloadIcon /> Resume
            </a>

            <a
              href={CONTACT.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.textLink}
            >
              <FaGithub size={15} aria-hidden="true" /> GitHub
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}