import { motion } from 'framer-motion'
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
//
// Once you run `npm install react-icons@latest`, you can swap any of
// these for a real brand logo from react-icons/si, e.g.:
//   TypeScript: SiTypescript, 'Next.js': SiNextdotjs, Django: SiDjango,
//   Supabase: SiSupabase, Firebase: SiFirebase, PostgreSQL: SiPostgresql,
//   Prisma: SiPrisma, 'VS Code': SiVisualstudiocode, Postman: SiPostman,
//   Bash: SiGnubash, Vercel: SiVercel, PowerShell: SiPowershell,
//   XAMPP: SiXampp, 'Claude Code': SiClaude, Gemini: SiGooglegemini,
//   Railway: SiRailway, ServiceNow: SiServicenow
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

export default function Skills() {
  const [ref, inView] = useInView()

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

        <div className={styles.groups}>
          {SKILL_GROUPS.map((group, gi) => (
            <motion.div
              key={group.key}
              className={styles.group}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: gi * 0.15 + 0.2, duration: 0.5 }}
            >
              <div className={styles.groupHeader}>
                <span className={styles.groupName}>{group.label}</span>
                <span className={styles.groupCount}>{group.skills.length}</span>
              </div>
              <div className={styles.groupDivider} />

              <div className={styles.grid}>
                {group.skills.map((skill) => {
                  const Icon = ICONS[skill.name]
                  return (
                    <div
                      key={skill.name}
                      className={styles.card}
                      style={{ '--skill-color': skill.color || 'var(--cyan)' }}
                    >
                      {Icon && (
                        <Icon className={styles.icon} style={{ color: skill.color }} />
                      )}
                      <span className={styles.name}>{skill.name}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}