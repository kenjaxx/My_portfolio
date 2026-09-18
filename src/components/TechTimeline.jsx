import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import {
  FaReact,
  FaPython,
  FaJava,
  FaHtml5,
  FaCss3Alt,
  FaNodeJs,
  FaGitAlt,
  FaAws,
  FaDatabase,
  FaCode,
  FaJs,
} from 'react-icons/fa'
import { TIMELINE_SKILLS } from '../data'
import styles from './TechTimeline.module.css'

// Only react-icons/fa is used here — that set is stable across every
// react-icons version, avoiding the "does not provide an export" errors
// hit earlier with newer Simple Icons (Si*) imports.
const ICONS = {
  JavaScript: FaJs,
  TypeScript: FaCode,
  Python: FaPython,
  Java: FaJava,
  HTML: FaHtml5,
  CSS: FaCss3Alt,
  SQL: FaDatabase,
  React: FaReact,
  'Node.js': FaNodeJs,
  Supabase: FaDatabase,
  Git: FaGitAlt,
  AWS: FaAws,
}

// Alternating vertical offsets so the strip reads as a connected
// timeline/circuit rather than a flat row of identical badges.
const OFFSETS = [6, 34, 14, 46, 4, 28, 42, 10, 22, 48, 8, 36]

function Node({ skill, index }) {
  const Icon = ICONS[skill.name]
  const offset = OFFSETS[index % OFFSETS.length]

  return (
    <div className={styles.node} style={{ '--offset': `${offset}px`, '--skill-color': skill.color }}>
      <div className={styles.badge}>
        {Icon && <Icon className={styles.badgeIcon} style={{ color: skill.color }} />}
        <span>{skill.name}</span>
      </div>
      <div className={styles.dot} />
      <div className={styles.stem} />
    </div>
  )
}

export default function TechTimeline() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % TIMELINE_SKILLS.length)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  // Duplicating the list lets the rail loop from -50% back to 0%
  // seamlessly, since the second half mirrors the first.
  const loopedSkills = useMemo(() => [...TIMELINE_SKILLS, ...TIMELINE_SKILLS], [])
  const active = TIMELINE_SKILLS[activeIndex]

  return (
    <div className={styles.wrap}>
      <div className={styles.counter}>
        <span className={styles.counterIndex}>{String(activeIndex + 1).padStart(2, '0')}</span>
        <span className={styles.counterName}>{active.name}</span>
        <span className={styles.counterTag}>always learning</span>
      </div>

      <div className={styles.track}>
        <motion.div
          className={styles.rail}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 26, ease: 'linear', repeat: Infinity }}
        >
          {loopedSkills.map((skill, i) => (
            <Node key={`${skill.name}-${i}`} skill={skill} index={i} />
          ))}
        </motion.div>

        {/* The "spark" — an original stand-in for a walking mascot: a
            small glowing comet drifting along the baseline with a
            fading trail, rather than a literal robot character. */}
        <motion.div
          className={styles.spark}
          animate={{ left: ['0%', '100%'] }}
          transition={{ duration: 6.5, ease: 'linear', repeat: Infinity }}
        >
          <motion.div
            className={styles.sparkCore}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, ease: 'easeInOut', repeat: Infinity }}
          />
          <div className={styles.sparkTrail} />
        </motion.div>

        <div className={styles.baseline} />
      </div>
    </div>
  )
}