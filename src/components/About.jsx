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
            <p className={styles.photoCaption}>
              <span className={styles.figTag}>FIG.01</span> {ABOUT.photoCaption}
            </p>
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
            </motion.div>

            <motion.div
              className={styles.eduCard}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              custom={6}
            >
              <SchoolBadge />
              <div>
                <p className={styles.eduSchool}>{ABOUT.education.school}</p>
                <p className={styles.eduDegree}>
                  {ABOUT.education.degree} · {ABOUT.education.period}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}