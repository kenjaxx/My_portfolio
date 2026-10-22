import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { useInView } from '../hooks/useInView'
import { PROFILE, ABOUT, SKILL_GROUPS } from '../data'
import { LEVELS, STATUS, getSkillInfo, getProjectsFor } from '../skillInfo'
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
// says which lane each skill belongs to. The details in the hover card (level,
// status, blurb) come from skillInfo.js, the same file the Skills popup reads.
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
// lane itself. The chips are bigger now, so eight of them are already wider
// than the 660px lane.
const MIN_CHIPS_PER_HALF = 8
// Seconds each chip takes to scroll past. Was 2.4; higher = slower.
const SECONDS_PER_CHIP = 5.5

/* Center magnify: the chip in the middle of each lane grows, and the chips
   around it shrink back to normal and fade a little. Tweak these to taste. */
const MAGNIFY_MAX = 0.32 // 0.32 = the center chip is 32% bigger
const MAGNIFY_RANGE = 130 // px from the lane's center where the growing happens
const FADE_MIN = 0.5 // opacity of chips far from the center (1 = no fade)

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/* ---------- Hover detail card ----------

   The lanes clip their content (overflow: hidden), so the card can't live
   inside them. It is rendered once, in a portal on <body>, at a fixed position
   computed from the hovered chip. The chips talk to it through this tiny
   module-level setter, so hovering never re-renders the whole About section
   (which would also nudge the 3D lanyard). */

const CARD_WIDTH = 250
const EDGE = 12

let setTip = () => {}

const showTip = (skill, event) => {
  // Hover cards are for mouse and pen. On touch there is no hover.
  if (event.pointerType === 'touch') return
  const rect = event.currentTarget.getBoundingClientRect()
  setTip({ skill, cx: rect.left + rect.width / 2, top: rect.top, bottom: rect.bottom })
}

const hideTip = () => setTip(null)

const PIPS = [1, 2, 3, 4, 5]

function SkillTip() {
  const [tip, set] = useState(null)

  useEffect(() => {
    setTip = set
    return () => {
      setTip = () => {}
    }
  }, [])

  // A fixed card would drift away from its chip while scrolling, so hide it.
  useEffect(() => {
    if (!tip) return undefined
    const hide = () => set(null)
    window.addEventListener('scroll', hide, { passive: true })
    return () => window.removeEventListener('scroll', hide)
  }, [tip])

  const info = tip ? getSkillInfo(tip.skill.name) : null
  const status = info ? STATUS[info.status] || STATUS.familiar : null
  const projects = tip ? getProjectsFor(tip.skill.name) : []

  // Above the chip by default, below it when there's no room at the top.
  const below = tip ? tip.top < 220 : false
  const half = CARD_WIDTH / 2 + EDGE
  const left = tip ? clamp(tip.cx, half, window.innerWidth - half) : 0

  return createPortal(
    <AnimatePresence>
      {tip && (
        <div
          key="tip-position"
          className={styles.tipPosition}
          style={{
            left,
            top: below ? tip.bottom + 10 : tip.top - 10,
            transform: below ? 'translateX(-50%)' : 'translate(-50%, -100%)',
          }}
        >
          <motion.div
            key={tip.skill.name}
            className={styles.tip}
            style={{ '--c': tip.skill.color, '--badge': status.color }}
            role="presentation"
            initial={{ opacity: 0, y: below ? -6 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: below ? -4 : 4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <div className={styles.tipHead}>
              <span className={styles.tipName}>{tip.skill.name}</span>
              <span className={styles.tipBadge}>
                <span className={styles.tipBadgeDot} />
                {status.label}
              </span>
            </div>

            <div className={styles.tipLevel}>
              <span className={styles.tipLevelName}>{LEVELS[info.level]}</span>
              <span className={styles.tipLevelNum}>{info.level} / 5</span>
            </div>
            <div className={styles.tipPips}>
              {PIPS.map((n) => (
                <i key={n} className={`${styles.tipPip} ${n <= info.level ? styles.tipPipOn : ''}`} />
              ))}
            </div>

            {info.blurb && <p className={styles.tipBlurb}>{info.blurb}</p>}

            {projects.length > 0 && (
              <p className={styles.tipUsed}>
                Used in {projects.map((project) => project.title).join(', ')}
              </p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function Chip({ skill }) {
  return (
    <span
      className={styles.chip}
      data-chip=""
      style={{ '--c': skill.color }}
      onPointerEnter={(event) => showTip(skill, event)}
      onPointerLeave={hideTip}
    >
      <span className={styles.chipDot} aria-hidden="true" />
      {skill.name}
    </span>
  )
}

/* ---------- One lane ----------

   The scrolling itself is a plain CSS animation (cheap, and it keeps the
   hover / Pause button behaviour). On top of that, while the lane is on screen
   and moving, a small requestAnimationFrame loop measures where each chip is
   relative to the lane's center and sets its scale and opacity directly on the
   element. No React state is involved, so nothing re-renders per frame. */

function Lane({ lane, index, magnify }) {
  const viewportRef = useRef(null)
  const repeats = Math.max(1, Math.ceil(MIN_CHIPS_PER_HALF / lane.skills.length))
  const duration = lane.skills.length * repeats * SECONDS_PER_CHIP

  useEffect(() => {
    if (!magnify) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined

    const viewport = viewportRef.current
    const track = viewport?.firstElementChild
    if (!viewport || !track) return undefined

    const chips = Array.from(viewport.querySelectorAll('[data-chip]'))
    let offsets = [] // each chip's center, measured from the track's left edge
    let widths = []
    let raf = 0
    let visible = true
    let lastLeft = null
    let lastWidth = -1

    // Layout positions ignore transforms, so scaling a chip never changes
    // where it is measured. Measured again whenever the lane is resized.
    const measure = () => {
      offsets = chips.map((chip) => chip.offsetLeft + chip.offsetWidth / 2)
      widths = chips.map((chip) => chip.offsetWidth)
      lastLeft = null
    }

    const update = (trackLeft, view) => {
      const mid = view.left + view.width / 2
      const fadeReach = view.width * 0.55

      // First pass: how big each chip should be, and which one is closest.
      const scales = new Array(chips.length)
      const dists = new Array(chips.length)
      let best = 0
      let bestDist = Infinity
      for (let i = 0; i < chips.length; i++) {
        const dist = trackLeft + offsets[i] - mid
        const abs = Math.abs(dist)
        const k = clamp(1 - abs / MAGNIFY_RANGE, 0, 1)
        scales[i] = 1 + MAGNIFY_MAX * k * k * (3 - 2 * k)
        dists[i] = dist
        if (abs < bestDist) {
          bestDist = abs
          best = i
        }
      }

      // The growing chip would overlap its neighbours, so everything on each
      // side slides outward by half of how much it grew.
      const growth = ((scales[best] - 1) * widths[best]) / 2
      const spread = widths[best] * 0.6

      // Second pass: write the styles.
      for (let i = 0; i < chips.length; i++) {
        const shift = clamp(dists[i] / spread, -1, 1) * growth
        const fade = FADE_MIN + (1 - FADE_MIN) * clamp(1 - Math.abs(dists[i]) / fadeReach, 0, 1)
        const chip = chips[i]
        chip.style.transform = `translateX(${shift.toFixed(2)}px) scale(${scales[i].toFixed(3)})`
        chip.style.opacity = fade.toFixed(3)
        chip.style.zIndex = Math.round((scales[i] - 1) * 100)
      }
    }

    const tick = () => {
      raf = 0
      if (!visible) return
      const trackLeft = track.getBoundingClientRect().left
      const view = viewport.getBoundingClientRect()
      // While the lane is paused (hover or the Pause button) nothing moves,
      // so there is nothing to recompute.
      if (trackLeft !== lastLeft || view.width !== lastWidth) {
        lastLeft = trackLeft
        lastWidth = view.width
        update(trackLeft, view)
      }
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick)
    }

    measure()
    start()

    const resizeObserver = new ResizeObserver(() => {
      measure()
      start()
    })
    resizeObserver.observe(viewport)
    resizeObserver.observe(track)

    // Fonts load late and change chip widths, so measure again once they're in.
    document.fonts?.ready.then(() => {
      measure()
      start()
    })

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
    })
    intersectionObserver.observe(viewport)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      chips.forEach((chip) => {
        chip.style.transform = ''
        chip.style.opacity = ''
        chip.style.zIndex = ''
      })
    }
  }, [magnify])

  return (
    <li className={styles.lane}>
      <span className={styles.laneLabel}>{lane.label}</span>
      {/* The moving copy is hidden from assistive tech; this is the real list. */}
      <span className={styles.srOnly}>
        {lane.skills
          .map((skill) => `${skill.name} (${LEVELS[getSkillInfo(skill.name).level]})`)
          .join(', ')}
      </span>
      <div ref={viewportRef} className={styles.viewport} aria-hidden="true">
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

  // The magnify effect needs moving lanes, so it's off on weak devices
  // (they get the still layout) and until the section is on screen.
  const magnify = inView && !lowPower

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
                  <Lane key={lane.label} lane={lane} index={i} magnify={magnify} />
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

      <SkillTip />
    </section>
  )
}