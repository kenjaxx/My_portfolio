import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback, memo, lazy, Suspense } from 'react'
import { FaGithub, FaExclamationTriangle, FaLightbulb, FaCheckCircle, FaEye } from 'react-icons/fa'
import { useInView } from '../hooks/useInView'
import { PROJECTS } from '../data'
import { getDeviceTier } from '../utils/deviceTier'
import Modal from './Modal'
import styles from './Projects.module.css'

const Carousel = memo(lazy(() => import('./CircularCarousel')))
const SplitFlapText = lazy(() => import('./SplitFlapText'))
const SpecularButton = lazy(() => import('./SpecularButton'))

// Read once at module load. Weak devices get a plain button instead of the
// WebGL specular one.
const tier = getDeviceTier()

// Only projects that have a cover image go on the ring.
const SHOWN = PROJECTS.filter((p) => p.image)

// 1 = each project appears once on the ring (cards look biggest).
// Raise to 2 for a fuller ring, but cards will appear smaller.
const REPEATS = 1

// How long the ring stays still after a prev / next click, in milliseconds.
// Then it starts spinning again by itself.
const RESUME_DELAY = 2000

// The ring itself has no captions any more. The project name, number and
// tagline are drawn above the carousel (see the "showcase" block below).
const ITEMS = Array.from({ length: REPEATS }, () => SHOWN)
  .flat()
  .map((p) => ({
    src: p.image,
    alt: p.title,
    title: p.title,
  }))

// The three cards shown in every project popup.
// `key` is the field name in data.js, `label` is what the visitor sees,
// and `color` tints the card's top edge, icon and label.
const STORY = [
  { key: 'problem', label: 'Problem', Icon: FaExclamationTriangle, color: '#ffca28' },
  { key: 'solution', label: 'Solution', Icon: FaLightbulb, color: '#00d4ff' },
  { key: 'result', label: 'Result', Icon: FaCheckCircle, color: '#00ff88' },
]

// Look shared by both split-flap boards in the popup.
const FLAP_PROPS = {
  tileStyle: 'board',
  tileColor: '#171726',
  textColor: '#ffffff',
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

/* Sizes the title board so it always fits inside the popup.
   Each tile + gap is about 0.9em wide, so the font size is
   (available width) / (characters * 0.9), capped at 30px.
   The available width is the popup's inner width: up to 540px on desktop,
   and (screen width - 120px) on phones. */
const titleFontSize = (length) =>
  `min(30px, calc(min(540px, 100vw - 120px) / ${(Math.max(length, 1) * 0.9).toFixed(2)}))`

function ExternalIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function ChevronIcon({ direction }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === 'left' ? (
        <polyline points="15 5 8 12 15 19" />
      ) : (
        <polyline points="9 5 16 12 9 19" />
      )}
    </svg>
  )
}

/* ---------- The "View project" button ----------

   A glass button whose edge catches the light and follows the cursor
   (SpecularButton, from React Bits). The chunk loads lazily, and while it
   loads (and on low-power devices) the global .glass-btn is shown instead,
   which has the same label, size and look, so nothing jumps. */

function ViewButton({ onClick }) {
  const content = (
    <>
      <FaEye size={16} aria-hidden="true" />
      View project
    </>
  )

  const plain = (
    <button type="button" className="glass-btn" onClick={onClick}>
      {content}
    </button>
  )

  if (tier.lowPower) return plain

  return (
    <Suspense fallback={plain}>
      <SpecularButton
        className={styles.viewBtn}
        size="md"
        radius={999}
        tint="#00d4ff"
        tintOpacity={0.08}
        textColor="#ffffff"
        lineColor="#00d4ff"
        baseColor="#475569"
        intensity={1.1}
        idleIntensity={0.55}
        shineSize={14}
        shineFade={40}
        thickness={1.4}
        glow={1}
        followMouse
        proximity={300}
        onClick={onClick}
      >
        {content}
      </SpecularButton>
    </Suspense>
  )
}

/* ---------- The expanded project card (popup) ---------- */

function ProjectModal({ selected, onClose }) {
  // The split-flap text only starts once the popup has finished growing in,
  // so the two animations never compete with each other.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (selected) setReady(false)
  }, [selected])

  const project = selected?.project
  const titleText = project ? project.title.toUpperCase() : ''
  const numText = project ? `PROJECT ${project.id}` : ''

  return (
    <Modal
      open={Boolean(selected)}
      onClose={onClose}
      label={project ? `${project.title} project details` : 'Project details'}
      origin={selected ? { dx: selected.dx, dy: selected.dy } : undefined}
      overlayClassName={styles.overlay}
      panelClassName={styles.detail}
      closeClassName="glass-btn glass-btn--icon glass-btn--corner"
      closeLabel="Close project details"
      panelStyle={{ '--project-color': project?.color || 'var(--purple)' }}
      onOpened={() => setReady(true)}
    >
      {project && (
        <>
          {/* "PROJECT 003" + Featured badge */}
          <div className={styles.numRow}>
            <div className={styles.numSlot}>
              {ready && (
                <Suspense fallback={null}>
                  <SplitFlapText
                    {...FLAP_PROPS}
                    text={numText}
                    padTo={numText.length}
                    fontSize={13}
                    flipsPerChar={4}
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
              <Suspense fallback={null}>
                <SplitFlapText
                  {...FLAP_PROPS}
                  text={titleText}
                  padTo={titleText.length}
                  fontSize={titleFontSize(titleText.length)}
                />
              </Suspense>
            )}
          </div>

          {/* Problem / solution / result: three color-coded cards */}
          <dl
            className={`${styles.story} ${styles.fade} ${ready ? styles.fadeOn : ''}`}
            style={{ transitionDelay: '0.15s' }}
          >
            {STORY.map(({ key, label, Icon, color }) => (
              <div key={key} className={styles.card} style={{ '--card-color': color }}>
                <Icon className={styles.cardIcon} aria-hidden="true" />
                <dt className={styles.cardLabel}>{label}</dt>
                <dd className={styles.cardText}>{project[key]}</dd>
              </div>
            ))}
          </dl>

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
                className="glass-btn glass-btn--accent"
                aria-label={`View ${project.title} live`}
              >
                View Live
                <ExternalIcon />
              </a>
            ) : (
              <span className="glass-btn glass-btn--sm glass-btn--mono glass-btn--disabled">
                Live demo coming soon
              </span>
            )}

            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-btn"
                aria-label={`${project.title} source code on GitHub`}
              >
                <FaGithub size={16} aria-hidden="true" />
                Code
              </a>
            )}
          </div>
        </>
      )}
    </Modal>
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

  // Index of the card at the front of the ring. The carousel reports it
  // through onChange, and the header above the ring follows it.
  const [active, setActive] = useState(0)

  // The carousel fills this with { next, prev }. After either one runs, the
  // carousel holds still for RESUME_DELAY ms and then drifts again.
  const controlsRef = useRef(null)

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

  // Clicking a card on the ring still opens it.
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

  const goNext = useCallback(() => controlsRef.current?.next(), [])
  const goPrev = useCallback(() => controlsRef.current?.prev(), [])

  // Spin all the time, except while the mouse is on a card or the popup is open.
  const paused = overCard || !!selected

  // The project at the front of the ring, for the header above it.
  const slot = active % SHOWN.length
  const current = SHOWN[slot]
  const numberText = String(slot + 1).padStart(2, '0')

  // The "View project" button opens whichever project is at the front of the
  // ring, and the popup grows out of the button itself.
  const handleView = useCallback(
    (event) => {
      const project = SHOWN[slot]
      if (!project) return

      const rect = event.currentTarget.getBoundingClientRect()
      const dx = rect.left + rect.width / 2 - window.innerWidth / 2
      const dy = rect.top + rect.height / 2 - window.innerHeight / 2

      setSelected({ project, dx, dy })
    },
    [slot]
  )

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

      {/* Header above the ring: a big faded number behind the project name,
          then a one-line tagline. It changes as the ring turns. */}
      <motion.div
        className={styles.showcase}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            className={styles.showcaseInner}
            style={{ '--hdr-color': current.color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <span className={styles.bigNum} aria-hidden="true">
              {numberText}
            </span>
            <h3 className={styles.showTitle}>{current.title}</h3>
            <p className={styles.showTagline}>{current.tagline}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

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
              depthFade={0.6}
              fadeColor="#0a0a0f"
              focusOnClick={false}
              onItemClick={handleItemClick}
              onChange={setActive}
              controlsRef={controlsRef}
              resumeDelay={RESUME_DELAY}
            />
          </Suspense>
        )}
      </motion.div>

      {/* Control dock under the ring: previous, View project, next.
          The dots show which project is at the front. */}
      {inView && (
        <motion.div
          className={styles.dockWrap}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className={styles.dock}>
            <button
              type="button"
              className="glass-btn glass-btn--icon"
              onClick={goPrev}
              aria-label="Previous project"
            >
              <ChevronIcon direction="left" />
            </button>

            <ViewButton onClick={handleView} />

            <button
              type="button"
              className="glass-btn glass-btn--icon"
              onClick={goNext}
              aria-label="Next project"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <div className={styles.dots} aria-hidden="true">
            {SHOWN.map((p, i) => (
              <span key={p.id} className={`${styles.dot} ${i === slot ? styles.dotOn : ''}`} />
            ))}
          </div>
        </motion.div>
      )}

      <ProjectModal selected={selected} onClose={closeModal} />
    </section>
  )
}