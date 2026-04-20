import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import styles from './About.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
}

export default function About() {
  const [ref, inView] = useInView()

  return (
    <section id="about" className={styles.section} ref={ref}>
      <div className={styles.inner}>
        <motion.p className={styles.label} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0}>
          01. &gt; about_me
        </motion.p>
        <motion.h2 className={styles.title} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={1}>
          Who I Am
        </motion.h2>
        <div className={styles.divider} />

        <div className={styles.grid}>
          <motion.div
            className={styles.avatarWrap}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            custom={2}
          >
            <div className={styles.avatar}>
              <span>KE</span>
              <div className={styles.avatarRing} />
            </div>
            <div className={styles.statusBadge}>
              <span className={styles.statusDot} />
              Available for projects
            </div>
          </motion.div>

          <div className={styles.textCol}>
            {[
              <>Hey! I'm <span className={styles.cyan}>Kenji Ermita</span>, a passionate Full Stack Developer who loves turning ideas into real, working products. I enjoy crafting everything from pixel-perfect UIs to well-structured backend systems.</>,
              <>I specialize in <span className={styles.purple}>React</span> on the frontend, <span className={styles.purple}>Python & Java</span> on the backend, and <span className={styles.green}>Supabase</span> for real-time databases. Whether it's a web app, a CMS, or a REST API — I build it end-to-end.</>,
              <>Currently pursuing my degree in <span className={styles.cyan}>IT</span>, constantly learning, building side projects, and sharpening my skills one commit at a time.</>,
            ].map((text, i) => (
              <motion.p
                key={i}
                className={styles.para}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                custom={i + 3}
              >
                {text}
              </motion.p>
            ))}

            <motion.div className={styles.stats} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={6}>
              {[
                { num: '10+', label: 'Technologies' },
                { num: '3+', label: 'Projects Built' },
                { num: '∞', label: 'Lines of Code' },
              ].map((s) => (
                <div key={s.label} className={styles.stat}>
                  <span className={styles.statNum}>{s.num}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
