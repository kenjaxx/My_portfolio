import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { PROFILE, ABOUT, CONTACT } from '../data'
import styles from './About.module.css'

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

/* ---------- Bio with colored keywords ---------- */

const KEYWORDS = ABOUT.keywords ?? {}
const KEYWORD_RE = Object.keys(KEYWORDS).length
  ? new RegExp(`\\b(${Object.keys(KEYWORDS).join('|')})\\b`)
  : null

function Bio({ text }) {
  if (!KEYWORD_RE) return text
  // split() with a capture group puts every match at an odd index.
  return text.split(KEYWORD_RE).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={styles.kw} style={{ '--kw': KEYWORDS[part] }}>
        {part}
      </span>
    ) : (
      part
    )
  )
}

/* ---------- Count-up number ---------- */

function CountUp({ to, suffix = '', run, delay = 0 }) {
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!run) return

    // Visitors who prefer reduced motion get the final number right away.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(to)
      return
    }

    let raf
    const timer = setTimeout(() => {
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / 1400, 1)
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3)))) // ease-out
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [run, to, delay])

  return (
    <>
      {val}
      {suffix}
    </>
  )
}

/* ---------- Icons ---------- */

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
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
            onError={() => setErrored(true)}
          />
        )}
      </div>
    </div>
  )
}

/* ---------- Timeline badges ---------- */

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
      onError={() => setErrored(true)}
    />
  )
}

/* ---------- Section ---------- */

export default function About() {
  const [ref, inView] = useInView()

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
          <motion.div
            className={styles.photoCol}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            custom={0}
          >
            <Photo />
          </motion.div>

          <div className={styles.textCol}>
            <motion.span
              className={styles.badge}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={1}
            >
              {ABOUT.badge}
            </motion.span>

            <motion.h2
              className={styles.heading}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={2}
            >
              <span className={styles.headingGradient}>{ABOUT.headingGradient}</span>{' '}
              {ABOUT.headingRest}
            </motion.h2>

            <motion.p
              className={styles.bio}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={3}
            >
              <Bio text={ABOUT.bio} />
            </motion.p>

            <motion.div
              className={styles.stats}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={4}
            >
              {ABOUT.stats.map((s, i) => (
                <div key={s.label} className={styles.stat}>
                  <span className={styles.statNum}>
                    {s.text ?? (
                      <CountUp to={s.num} suffix={s.suffix} run={inView} delay={500 + i * 150} />
                    )}
                  </span>
                  <span className={styles.statLabel}>{s.label}</span>
                  <span className={styles.bar} aria-hidden="true">
                    <span
                      className={`${styles.barFill} ${inView ? styles.barOn : ''}`}
                      style={{ transitionDelay: `${0.5 + i * 0.15}s` }}
                    />
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div
              className={styles.metaBlock}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={5}
            >
              <div className={styles.statusRow}>
                <span className={styles.statusDot} />
                Available for projects
              </div>

              <div className={styles.contactRow}>
                {CONTACT.email && <span>{CONTACT.email}</span>}
                {ABOUT.phone && <span>{ABOUT.phone}</span>}
                {ABOUT.location && <span>{ABOUT.location}</span>}
              </div>

            
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