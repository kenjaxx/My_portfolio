import { motion } from 'framer-motion'
import { useState } from 'react'
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

function Photo() {
  const [errored, setErrored] = useState(false)

  return (
    <div className={styles.photoFrame}>
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
      <span className={styles.cornerTL} />
      <span className={styles.cornerBR} />
    </div>
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

export default function About() {
  const [ref, inView] = useInView()

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
              {ABOUT.headingLead && `${ABOUT.headingLead} `}
              <span className={styles.headingAccent}>{ABOUT.headingAccent}</span>
            </motion.h2>

            <motion.p
              className={styles.bio}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={3}
            >
              {ABOUT.bio}
            </motion.p>

            <motion.div
              className={styles.stats}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={4}
            >
              {ABOUT.stats.map((s) => (
                <div key={s.label} className={styles.stat}>
                  <span className={styles.statNum}>{s.num}</span>
                  <span className={styles.statLabel}>{s.label}</span>
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

              {CONTACT.resume && (
                <a href={CONTACT.resume} download className={styles.resumeBtn}>
                  <DownloadIcon />
                  Download Resume
                </a>
              )}
            </motion.div>

            <motion.div
              className={styles.cardsRow}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={6}
            >
              <div className={styles.eduCard}>
                <SchoolBadge />
                <div>
                  <p className={styles.eduSchool}>{ABOUT.education.school}</p>
                  <p className={styles.eduDegree}>
                    {ABOUT.education.degree} · {ABOUT.education.period}
                  </p>
                </div>
              </div>

              {ABOUT.experience && (
                <div className={styles.eduCard}>
                  <ExperienceBadge />
                  <div>
                    <p className={styles.eduSchool}>{ABOUT.experience.company}</p>
                    <p className={styles.eduDegree}>
                      {ABOUT.experience.role} · {ABOUT.experience.period}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}