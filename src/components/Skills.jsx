import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { SKILLS } from '../data'
import styles from './Skills.module.css'

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
          02. &gt; tech_stack
        </motion.p>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Skills & Tools
        </motion.h2>
        <div className={styles.divider} />

        <div className={styles.grid}>
          {SKILLS.map((skill, i) => (
            <motion.div
              key={skill.name}
              className={styles.card}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ delay: i * 0.06 + 0.2, duration: 0.4 }}
              whileHover={{ y: -6, borderColor: skill.color || 'var(--cyan)' }}
            >
              <span className={styles.icon}>{skill.icon}</span>
              <span className={styles.name}>{skill.name}</span>
              <div className={styles.cardGlow} style={{ background: `radial-gradient(circle at 50% 120%, ${skill.color}18, transparent 70%)` }} />
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.codeBlock}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <div className={styles.codeHeader}>
            <span className={styles.dot} style={{ background: '#ff5f57' }} />
            <span className={styles.dot} style={{ background: '#febc2e' }} />
            <span className={styles.dot} style={{ background: '#28c840' }} />
            <span className={styles.fileName}>kenji.config.js</span>
          </div>
          <pre className={styles.code}>{`const kenji = {
  frontend:  ["React", "HTML", "CSS", "JavaScript"],
  backend:   ["Java", "Python", "REST APIs"],
  database:  ["Supabase", "MySQL"],
  cms:       ["WordPress"],
  currently: "Building something awesome ✦"
}`}</pre>
        </motion.div>
      </div>
    </section>
  )
}
