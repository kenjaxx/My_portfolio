import { motion } from 'framer-motion'
import { useMemo, useState, lazy, Suspense } from 'react'
import { useInView } from '../hooks/useInView'
import { PROFILE, ABOUT } from '../data'
import { getDeviceTier } from '../utils/deviceTier'
import styles from './About.module.css'

// Three.js lives in its own chunk and only downloads when it's needed.
const Lanyard = lazy(() => import('./Lanyard'))

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' },
  }),
}

const slideIn = {
  hidden: { opacity: 0, x: -16 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.9 + i * 0.2, duration: 0.5, ease: 'easeOut' },
  }),
}

// The flip cards rise one after the other, starting once the bio is in.
const cardIn = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.55 + i * 0.13, duration: 0.6, ease: 'easeOut' },
  }),
}

/* ---------- Flip cards ----------

   Each card is a real <button>, so it works with mouse, touch and keyboard
   (Enter / Space) and is announced as a toggle by screen readers. Both faces
   stay in the DOM, so the title and the text are always readable by assistive
   tech, whichever side is showing. The turn itself is pure CSS (see
   About.module.css). */

function FlipCard({ card, index, flipped, onToggle, inView }) {
  return (
    <motion.li
      className={styles.cardItem}
      variants={cardIn}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={index}
    >
      <button
        type="button"
        className={`${styles.card} ${flipped ? styles.flipped : ''}`}
        style={{ '--c': card.color }}
        aria-pressed={flipped}
        onClick={onToggle}
      >
        <span className={styles.inner}>
          <span className={`${styles.face} ${styles.front}`}>
            <span className={styles.wm} aria-hidden="true">
              {card.num}
            </span>
            <span className={styles.accent} aria-hidden="true" />
            <span className={styles.cardTitle}>{card.title}</span>
            <span className={styles.hint} aria-hidden="true">
              <span className={styles.hintTouch}>Tap to flip</span>
              <span className={styles.hintMouse}>Click to flip</span>
            </span>
          </span>
          <span className={`${styles.face} ${styles.back}`}>
            <span className={styles.cardText}>{card.text}</span>
          </span>
        </span>
      </button>
    </motion.li>
  )
}

/* ---------- Timeline badges ---------- */

function BriefcaseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

function SchoolBadge() {
  const [errored, setErrored] = useState(false)

  if (errored || !PROFILE.schoolLogo) {
    return <div className={styles.eduBadge}>KE</div>
  }

  return (
    <img
      src={PROFILE.schoolLogo}
      alt={ABOUT.education.school}
      className={styles.eduBadgeImg}
      width={42}
      height={42}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
    />
  )
}

function ExperienceBadge() {
  const [errored, setErrored] = useState(false)

  if (errored || !PROFILE.experienceLogo) {
    return (
      <div className={styles.expBadge}>
        <BriefcaseIcon />
      </div>
    )
  }

  return (
    <img
      src={PROFILE.experienceLogo}
      alt={ABOUT.experience.company}
      className={styles.eduBadgeImg}
      width={42}
      height={42}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
    />
  )
}

let webglSupport // undefined = not checked yet

// Runs once. Previously this created a new WebGL context on every render,
// and browsers cap how many contexts can exist at the same time.
function supportsWebGL() {
  if (webglSupport !== undefined) return webglSupport
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    webglSupport = Boolean(gl)
    // Free the probe context right away so it doesn't count against the
    // limit (RetroGrid, GlassIcons and Lanyard need theirs).
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglSupport = false
  }
  return webglSupport
}

/* ---------- Photo: arch, morphing glow, orbiting dots ---------- */

function Photo() {
  const [errored, setErrored] = useState(false)

  return (
    <div className={styles.stage}>
      <span className={styles.blob} aria-hidden="true" />

      <span className={styles.orbit} aria-hidden="true">
        <i className={styles.orbitDotA} />
        <i className={styles.orbitDotB} />
      </span>

      <div className={styles.arch}>
        {errored ? (
          <div className={styles.photoFallback}>
            <span>KE</span>
          </div>
        ) : (
          <img
            src={PROFILE.aboutPhoto}
            alt="Kenji Ermita"
            className={styles.photo}
            width={800}
            height={800}
            decoding="async"
            onError={() => setErrored(true)}
          />
        )}
      </div>
    </div>
  )
}

/* ---------- Section ---------- */

export default function About() {
  const [ref, inView] = useInView()

  // Which cards are turned over, by id. Every card flips on its own.
  const [flipped, setFlipped] = useState({})
  const toggleCard = (id) => setFlipped((prev) => ({ ...prev, [id]: !prev[id] }))

  // Computed once. Weak devices get the static photo instead of the 3D lanyard.
  // To keep the lanyard on every device, use: useMemo(() => supportsWebGL(), [])
  const lowPower = useMemo(() => getDeviceTier().lowPower, [])
  const useLanyard = useMemo(() => supportsWebGL() && !lowPower, [lowPower])

  // Shared entrance animation. `i` staggers the elements top to bottom.
  const reveal = (i) => ({
    variants: fadeUp,
    initial: 'hidden',
    animate: inView ? 'visible' : 'hidden',
    custom: i,
  })

  // Read top to bottom: school first, then the current role (pulsing green dot).
  const timeline = [
    {
      key: 'edu',
      now: false,
      badge: <SchoolBadge />,
      title: ABOUT.education.school,
      sub: `${ABOUT.education.degree} · ${ABOUT.education.period}`,
    },
    ABOUT.experience && {
      key: 'exp',
      now: true,
      badge: <ExperienceBadge />,
      title: ABOUT.experience.company,
      sub: `${ABOUT.experience.role} · ${ABOUT.experience.period}`,
    },
  ].filter(Boolean)

  return (
    <section id="about" className={styles.section} ref={ref}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <motion.div className={styles.photoCol} {...reveal(0)}>
            {useLanyard ? (
              <div className={styles.lanyardWrap}>
                {/* Mounted only once the section is in view, so the chunk loads
                    (usually already prefetched) and the drop-in plays on scroll. */}
                {inView && (
                  <Suspense fallback={null}>
                    <Lanyard
                      frontImage={PROFILE.aboutPhoto}
                      imageFit="cover"
                      cardColor="#0f0f1a"
                      orientation="portrait"
                      finish="glossy"
                      cornerRadius={0.35}
                      size={0.55}
                      anchor="center"
                      strapLength={0.45}
                      strapColor="#00d4ff"
                      strapWidth={0.65}
                      metal="silver"
                      gravity={1}
                      damping={0.5}
                      elasticity={0.5}
                      breeze={0.3}
                      interactive
                      intro
                    />
                  </Suspense>
                )}
              </div>
            ) : (
              <Photo />
            )}
          </motion.div>

          <div className={styles.textCol}>
            <motion.span className={styles.badge} {...reveal(1)}>
              {ABOUT.badge}
            </motion.span>

            <motion.h2 className={styles.heading} {...reveal(2)}>
              <span className={styles.headingGradient}>{ABOUT.headingGradient}</span>{' '}
              {ABOUT.headingRest}
            </motion.h2>

            <motion.p className={styles.bio} {...reveal(3)}>
              {ABOUT.bio}
            </motion.p>

            <motion.div className={styles.cardsWrap} {...reveal(4)}>
              <p className={styles.cardsLabel} aria-hidden="true">
                &gt; what_i_bring
              </p>
              <ul className={styles.cards} aria-label="What I bring">
                {ABOUT.cards.map((card, i) => (
                  <FlipCard
                    key={card.id}
                    card={card}
                    index={i}
                    flipped={Boolean(flipped[card.id])}
                    onToggle={() => toggleCard(card.id)}
                    inView={inView}
                  />
                ))}
              </ul>
            </motion.div>

            <ol className={styles.timeline}>
              {timeline.map((item, i) => (
                <motion.li
                  key={item.key}
                  className={styles.tlItem}
                  variants={slideIn}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  custom={i}
                >
                  <span
                    className={`${styles.dot} ${item.now ? styles.dotNow : ''}`}
                    aria-hidden="true"
                  />
                  <div className={styles.eduCard}>
                    {item.badge}
                    <div>
                      <p className={styles.eduSchool}>{item.title}</p>
                      <p className={styles.eduDegree}>{item.sub}</p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}