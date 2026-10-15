import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useInView } from '../hooks/useInView'
import CircularCarousel from './CircularCarousel'
import { PROJECTS, CONTACT } from '../data'
import styles from './Projects.module.css'

// Only projects that have a cover image go on the ring.
const SHOWN = PROJECTS.filter((p) => p.image)

// With only a few projects the ring looks sparse, so each one is repeated.
// 4 projects x 2 = 8 cards. Raise to 3 if you want it fuller.
const REPEATS = 2

const ITEMS = Array.from({ length: REPEATS }, () => SHOWN)
  .flat()
  .map((p) => ({
    src: p.image,
    alt: p.title,
    title: p.title,
    subtitle: `Project ${p.id}`,
  }))

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

export default function Projects() {
  const [ref, inView] = useInView()
  const [active, setActive] = useState(0)

  const project = SHOWN[active] ?? SHOWN[0]

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

      <motion.div
        className={styles.stage}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {/* Mounted only once the section is visible, so the intro
            plays when the visitor actually scrolls here. */}
        {inView && (
          <CircularCarousel
            items={ITEMS}
            preset="cylinder"
            intro="rise"
            cardWidth={320}
            aspectRatio={1.6}
            gap={24}
            cornerRadius={14}
            autoplay="step"
            interval={5}
            direction="left"
            depthFade={0.6}
            fadeColor="#0a0a0f"
            onChange={(i) => setActive(i % SHOWN.length)}
          />
        )}
      </motion.div>

      <p className={styles.hint}>Drag, swipe or click a card to browse</p>

      <div className={styles.inner}>
        <div className={styles.detailWrap} aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={project.id}
              className={styles.detail}
              style={{ '--project-color': project.color || 'var(--purple)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <span className={styles.num}>
                Project {project.id}
                {project.featured && <span className={styles.featuredBadge}>Featured</span>}
              </span>

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
                  >
                    <GitHubIcon />
                    Code
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

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