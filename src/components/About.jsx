import { motion } from 'framer-motion'
import { useMemo, useState, lazy, Suspense } from 'react'
import { useInView } from '../hooks/useInView'
import { PROFILE, ABOUT, SKILL_GROUPS } from '../data'
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

/* ---------- Skill lanes, built from the Skills & Tools data ---------- */

// Every skill (name + brand color) comes from SKILL_GROUPS in data.js, so the
// About section and the Skills section can never drift apart. ABOUT.lanes only
// says which lane each skill belongs to.
const ALL_SKILLS = SKILL_GROUPS.flatMap((group) => group.skills)
const SKILL_BY_NAME = new Map(ALL_SKILLS.map((skill) => [skill.name, skill]))

function buildLanes() {
  const lanes = ABOUT.lanes.map((lane) => ({
    label: lane.label,
    skills: lane.names.map((name) => SKILL_BY_NAME.get(name)).filter(Boolean),
  }))

  // A skill added to the Skills section but not assigned to a lane yet lands
  // in the last lane, so it still shows up here.
  const placed = new Set(lanes.flatMap((lane) => lane.skills.map((skill) => skill.name)))
  const rest = ALL_SKILLS.filter((skill) => !placed.has(skill.name))
  if (rest.length > 0 && lanes.length > 0) lanes[lanes.length - 1].skills.push(...rest)

  return lanes.filter((lane) => lane.skills.length > 0)
}

const LANES = buildLanes()

// A lane scrolls by half of its track, so one half has to be wider than the
// lane itself. About nine chips is roughly 880px, wider than the 620px lane.
const MIN_CHIPS_PER_HALF = 9
const SECONDS_PER_CHIP = 2.4

function Chip({ skill }) {
  return (
    <span className={styles.chip} style={{ '--c': skill.color }}>
      <span className={styles.chipDot} aria-hidden="true" />
      {skill.name}
    </span>
  )
}

function Lane({ lane, index }) {
  const repeats = Math.max(1, Math.ceil(MIN_CHIPS_PER_HALF / lane.skills.length))
  const duration = lane.skills.length * repeats * SECONDS_PER_CHIP

  return (
    <li className={styles.lane}>
      <span className={styles.laneLabel}>{lane.label}</span>
      {/* The moving copy is hidden from assistive tech; this is the real list. */}
      <span className={styles.srOnly}>{lane.skills.map((skill) => skill.name).join(', ')}</span>
      <div className={styles.viewport} aria-hidden="true">
        <div
          className={`${styles.track} ${index % 2 === 1 ? styles.reverse : ''}`}
          style={{ '--dur': `${duration}s` }}
        >
          {Array.from({ length: repeats * 2 }, (_, copy) => (
            <div key={copy} className={`${styles.set} ${copy > 0 ? styles.dup : ''}`}>
              {lane.skills.map((skill) => (
                <Chip key={skill.name} skill={skill} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </li>
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
  const [paused, setPaused] = useState(false)

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

  // Lanes only move once the section is on screen, and weak devices get
  // still, wrapped chips instead (visitors who prefer reduced motion get the
  // same thing from the CSS).
  const lanesClass = [
    styles.lanes,
    inView ? styles.on : '',
    paused ? styles.userPaused : '',
    lowPower ? styles.still : '',
  ]
    .filter(Boolean)
    .join(' ')

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

            <motion.div className={lanesClass} {...reveal(4)}>
              <ul className={styles.laneList} aria-label="Tech stack">
                {LANES.map((lane, i) => (
                  <Lane key={lane.label} lane={lane} index={i} />
                ))}
              </ul>

              {!lowPower && (
                <button
                  type="button"
                  className={styles.pause}
                  aria-pressed={paused}
                  onClick={() => setPaused((value) => !value)}
                >
                  {paused ? 'Play motion' : 'Pause motion'}
                </button>
              )}
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