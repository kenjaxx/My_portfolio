import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaJava,
  FaPython,
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaDatabase,
  FaReact,
  FaPlug,
  FaGitAlt,
  FaGithub,
  FaWordpressSimple,
  FaNodeJs,
  FaAws,
  FaAndroid,
  FaTerminal,
  FaServer,
  FaRobot,
  FaGoogle,
  FaTrain,
  FaCogs,
  FaCode,
  FaWind,
} from 'react-icons/fa'
import { useInView } from '../hooks/useInView'
import { SKILL_GROUPS } from '../data'
import styles from './Skills.module.css'

// Maps a skill's display name to its brand-icon component. Every icon
// here comes from react-icons/fa (Font Awesome) only, since that set has
// existed unchanged in every published version of react-icons — this
// avoids the "does not provide an export" errors caused by an outdated
// react-icons install missing newer Simple Icons (Si*) exports.
const ICONS = {
  JavaScript: FaJs,
  TypeScript: FaCode,
  Python: FaPython,
  Java: FaJava,
  HTML: FaHtml5,
  CSS: FaCss3Alt,
  SQL: FaDatabase,
  React: FaReact,
  'Next.js': FaCode,
  'Tailwind CSS': FaWind,
  Django: FaServer,
  'Node.js': FaNodeJs,
  'REST API': FaPlug,
  Supabase: FaDatabase,
  Firebase: FaServer,
  MySQL: FaDatabase,
  PostgreSQL: FaDatabase,
  Prisma: FaDatabase,
  XAMPP: FaServer,
  WordPress: FaWordpressSimple,
  Git: FaGitAlt,
  GitHub: FaGithub,
  'VS Code': FaCode,
  'Claude Code': FaRobot,
  Gemini: FaGoogle,
  Postman: FaPlug,
  Bash: FaTerminal,
  PowerShell: FaTerminal,
  AWS: FaAws,
  Android: FaAndroid,
  Vercel: FaServer,
  Railway: FaTrain,
  ServiceNow: FaCogs,
}

const gridVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export default function Skills() {
  const [ref, inView] = useInView()
  const [activeKey, setActiveKey] = useState(SKILL_GROUPS[0]?.key)

  const activeGroup = SKILL_GROUPS.find((g) => g.key === activeKey) ?? SKILL_GROUPS[0]

  return (
    <section id="skills" className={styles.section} ref={ref}>
      <div className={styles.inner}>
        <motion.p
          className={styles.label}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          &gt; tech_stack
        </motion.p>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Skills & Tools
        </motion.h2>

        <motion.div
          className={styles.tabs}
          role="tablist"
          aria-label="Skill categories"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {SKILL_GROUPS.map((group) => (
            <button
              key={group.key}
              role="tab"
              type="button"
              aria-selected={activeKey === group.key}
              className={`${styles.tab} ${activeKey === group.key ? styles.tabActive : ''}`}
              onClick={() => setActiveKey(group.key)}
            >
              {group.label}
              <span className={styles.tabCount}>{group.skills.length}</span>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup.key}
            className={styles.grid}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {activeGroup.skills.map((skill) => {
              const Icon = ICONS[skill.name]
              return (
                <div
                  key={skill.name}
                  className={styles.card}
                  style={{ '--skill-color': skill.color || 'var(--cyan)' }}
                >
                  <span className={styles.iconBadge}>
                    {Icon && (
                      <Icon className={styles.icon} style={{ color: skill.color }} />
                    )}
                  </span>
                  <span className={styles.name}>{skill.name}</span>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}