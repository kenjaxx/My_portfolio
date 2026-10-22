import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback, memo, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { useInView } from '../hooks/useInView'
import { PROJECTS, CONTACT } from '../data'
import styles from './Projects.module.css'

const Carousel = memo(lazy(() => import('./CircularCarousel')))
const SplitFlapText = lazy(() => import('./SplitFlapText'))

// Only projects that have a cover image go on the ring.
const SHOWN = PROJECTS.filter((p) => p.image)

// 1 = each project appears once on the ring (cards look biggest).
// Raise to 2 for a fuller ring, but cards will appear smaller.
const REPEATS = 1

const ITEMS = Array.from({ length: REPEATS }, () => SHOWN)
  .flat()
  .map((p) => ({
    src: p.image,
    alt: p.title,
    title: p.title,
    subtitle: `Project ${p.id}`,
  }))

/* Sizes the title board so it always fits inside the popup.
   Each tile + gap is about 0.9em wide, so the font size is
   (available width) / (characters * 0.9), capped at 30px.
   The available width is the popup's inner width: up to 540px on desktop,
   and (screen width - 120px) on phones. */
const titleFontSize = (length) =>
  `min(30px, calc(min(540px, 100vw - 120px) / ${(Math.max(length, 1) * 0.9).toFixed(2)}))`

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

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  )
}

/* ---------- The expanded project card (popup) ---------- */

function ProjectModal({ selected, onClose }) {
  const closeRef = useRef(null)
  const detailRef = useRef(null)

  // The split-flap text only starts once the popup has finished growing in,
  // so the two animations never compete with each other.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
  }, [selected])

  useEffect(() => {
    if (!selected) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    // Lock page scrolling WITHOUT touching body overflow. Hiding the body
    // scrollbar changes the page width, which forces the whole page (and the
    // 3D carousel) to re-layout, and that was a big source of the lag.
    // Scrolling inside the popup itself is still allowed when it overflows.
    const blockScroll = (e) => {
      const detail = detailRef.current
      if (detail && detail.contains(e.target) && detail.scrollHeight > detail.clientHeight) {
        return
      }
      e.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', blockScroll, { passive: false })
    window.addEventListener('touchmove', blockScroll, { passive: false })

    // preventScroll stops the browser from jumping the page to the button.
    closeRef.current?.focus({ preventScroll: true })

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', blockScroll)
      window.removeEventListener('touchmove', blockScroll)
    }
  }, [selected, onClose])

  const project = selected?.project
  const titleText = project ? project.title.toUpperCase() : ''
  const numText = project ? `PROJECT ${project.id}` : ''

  return createPortal(
    <AnimatePresence>
      {selected && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            ref={detailRef}
            className={styles.detail}
            style={{ '--project-color': project.color || 'var(--purple)' }}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} project details`}
            // Grows out of the spot that was clicked, then settles in the centre.
            // Only transform + opacity are animated, so it stays on the GPU.
            initial={{ opacity: 0, scale: 0.4, x: selected.dx, y: selected.dy }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, x: selected.dx * 0.4, y: selected.dy * 0.4 }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 30,
              mass: 0.8,
              opacity: { duration: 0.15 },
            }}
            onAnimationComplete={() => {
              if (selected) setReady(true)
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close project details"
            >
              <CloseIcon />
            </button>

            {/* "PROJECT 003" + Featured badge */}
            <div className={styles.numRow}>
              <div className={styles.numSlot}>
  {ready && (
  <Suspense fallback={null}>
    <SplitFlapText
      text={titleText}
      padTo={titleText.length}
      tileStyle="board"
      tileColor="#171726"
      textColor="#ffffff"
      fontSize={titleFontSize(titleText.length)}
      gap="0.1em"
      tileRadius="0.12em"
      flipDuration={0.1}
      stagger={0.04}
      flipsPerChar={6}
      order="left"
      charset="alphanumeric"
      glare={0}
      depth={0.5}
      intro
    />
  </Suspense>
)}
</div>
              {project.featured && <span className={styles.featuredBadge}>Featured</span>}
            </div>

            {/* Project title on a split-flap board */}
            <div
              className={styles.titleSlot}
              role="heading"
              aria-level={3}
              aria-label={project.title}
              style={{ fontSize: titleFontSize(titleText.length) }}
            >
              {ready && (
                <SplitFlapText
                  text={titleText}
                  padTo={titleText.length}
                  tileStyle="board"
                  tileColor="#171726"
                  textColor="#ffffff"
                  fontSize={titleFontSize(titleText.length)}
                  gap="0.1em"
                  tileRadius="0.12em"
                  flipDuration={0.1}
                  stagger={0.04}
                  flipsPerChar={6}
                  order="left"
                  charset="alphanumeric"
                  glare={0}
                  depth={0.5}
                  intro
                />
              )}
            </div>

            <p
              className={`${styles.projectDesc} ${styles.fade} ${ready ? styles.fadeOn : ''}`}
              style={{ transitionDelay: '0.15s' }}
            >
              {project.description}
            </p>

            <div
              className={`${styles.tags} ${styles.fade} ${ready ? styles.fadeOn : ''}`}
              style={{ transitionDelay: '0.3s' }}
            >
              {project.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>

            <div
              className={`${styles.actions} ${styles.fade} ${ready ? styles.fadeOn : ''}`}
              style={{ transitionDelay: '0.45s' }}
            >
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
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/* ---------- Section ---------- */

export default function Projects() {
  const [ref, inView] = useInView()

  // { project, dx, dy } while a project is open, otherwise null.
  // dx/dy = where the click happened, relative to the screen centre,
  // so the popup can grow out of that spot.
  const [selected, setSelected] = useState(null)

  // True only while a mouse is directly over a card (not the empty space
  // around the ring). This is what pauses the spinning.
  const [overCard, setOverCard] = useState(false)

  // Remember the last pointer position inside the carousel.
  const lastPointer = useRef({ x: 0, y: 0 })

  const handleStageClickCapture = (e) => {
    lastPointer.current = { x: e.clientX, y: e.clientY }
  }

  // Runs on every mouse move over the stage. It only pauses when the thing
  // under the cursor is actually a card. React bails out of the state update
  // when the value doesn't change, so this is cheap.
  const handleStagePointerMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const onCard = !!(e.target.closest && e.target.closest('[data-cc-index]'))
    setOverCard(onCard)
  }

  const handleStagePointerLeave = () => setOverCard(false)

  const handleItemClick = useCallback((item, index) => {
    const project = SHOWN[index % SHOWN.length]
    if (!project) return

    const { x, y } = lastPointer.current
    // Keyboard activation has no pointer position, so just grow from the centre.
    const hasPointer = x !== 0 || y !== 0
    const dx = hasPointer ? x - window.innerWidth / 2 : 0
    const dy = hasPointer ? y - window.innerHeight / 2 : 0

    setSelected({ project, dx, dy })
  }, [])

  const closeModal = useCallback(() => {
    setSelected(null)
    setOverCard(false)
  }, [])

  // Spin all the time, except while the mouse is on a card or the popup is open.
  const paused = overCard || !!selected

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
        onClickCapture={handleStageClickCapture}
        onPointerMove={handleStagePointerMove}
        onPointerLeave={handleStagePointerLeave}
      >
        {/* Mounted only once the section is visible, so the intro
            plays when the visitor actually scrolls here. */}
        {inView && (
  <Suspense fallback={null}>
    <Carousel
      className={styles.carousel}
      items={ITEMS}
      preset="cylinder"
      intro="rise"
      cardWidth={680}
      aspectRatio={1.6}
      gap={24}
      cornerRadius={18}
      autoplay={paused ? 'off' : 'drift'}
      speed={12}
      direction="left"
      pauseOnHover={false}
      captions
      depthFade={0.6}
      fadeColor="#0a0a0f"
      focusOnClick={false}
      onItemClick={handleItemClick}
    />
  </Suspense>
)}
      </motion.div>

      <p className={styles.hint}>Hover a card to pause · drag or swipe to browse · click a card to open it</p>

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

      <ProjectModal selected={selected} onClose={closeModal} />
    </section>
  )
}