import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useInView } from '../hooks/useInView'
import { PROJECTS, CONTACT } from '../data'
import styles from './Projects.module.css'

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function ArrowIcon({ flipped }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ transform: flipped ? 'scaleX(-1)' : undefined }}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

// Shown when a project has no screenshot yet (or the image fails to load),
// so new projects never look broken/empty.
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

const cardVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 70 : -70,
    y: 24,
    rotate: direction > 0 ? 7 : -7,
    scale: 0.94,
    opacity: 0,
  }),
  center: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 320, damping: 32 },
  },
  exit: (direction) => ({
    x: direction > 0 ? -90 : 90,
    rotate: direction > 0 ? -9 : 9,
    scale: 0.92,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeInOut' },
  }),
}

export default function Projects() {
  const [ref, inView] = useInView()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const total = PROJECTS.length
  const current = PROJECTS[index]
  const behind1 = PROJECTS[(index + 1) % total]
  const behind2 = PROJECTS[(index + 2) % total]

  const goNext = () => {
    setDirection(1)
    setIndex((i) => (i + 1) % total)
  }
  const goPrev = () => {
    setDirection(-1)
    setIndex((i) => (i - 1 + total) % total)
  }
  const goTo = (i) => {
    setDirection(i > index ? 1 : -1)
    setIndex(i)
  }

  // Left/right arrow key navigation while the section is in view.
  useEffect(() => {
    if (!inView || total <= 1) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inView, index, total])

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

        <div className={styles.stackArea}>
          <div className={styles.deck}>
            {total > 2 && (
              <div className={styles.backCard} style={{ '--depth': 2 }} aria-hidden="true">
                <span className={styles.backCardLabel}>{behind2.title}</span>
              </div>
            )}
            {total > 1 && (
              <div className={styles.backCard} style={{ '--depth': 1 }} aria-hidden="true">
                <span className={styles.backCardLabel}>{behind1.title}</span>
              </div>
            )}

            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
              <motion.div
                key={current.id}
                className={styles.frontCard}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag={total > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -80) goNext()
                  else if (info.offset.x > 80) goPrev()
                }}
              >
                {current.featured && (
                  <span className={styles.featuredBadge}>Featured</span>
                )}

                <ProjectCover project={current} />

                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <span className={styles.num}># {current.id}</span>
                    <div className={styles.links}>
                      {current.github && (
                        <a href={current.github} target="_blank" rel="noopener noreferrer" className={styles.iconLink} title="GitHub">
                          <GitHubIcon />
                        </a>
                      )}
                      {current.live && (
                        <a href={current.live} target="_blank" rel="noopener noreferrer" className={styles.iconLink} title="Live Demo">
                          <ExternalIcon />
                        </a>
                      )}
                    </div>
                  </div>

                  <h3 className={styles.projectTitle}>{current.title}</h3>
                  <p className={styles.projectDesc}>{current.description}</p>

                  <div className={styles.tags}>
                    {current.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={styles.controls}>
            <button onClick={goPrev} className={styles.navBtn} aria-label="Previous project">
              <ArrowIcon flipped />
            </button>

            <div className={styles.dots}>
              {PROJECTS.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => goTo(i)}
                  className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
                  aria-label={`Go to ${p.title}`}
                  aria-current={i === index ? 'true' : undefined}
                />
              ))}
            </div>

            <button onClick={goNext} className={styles.navBtn} aria-label="Next project">
              <ArrowIcon />
            </button>
          </div>

          <p className={styles.counter}>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>
        </div>

        <motion.div
          className={styles.moreWrap}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" className={styles.moreLink}>
            <GitHubIcon />
            See more on GitHub →
          </a>
        </motion.div>
      </div>
    </section>
  )
}