import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { CONTACT } from '../data'
import styles from './Contact.module.css'

export default function Contact() {
  const [ref, inView] = useInView()

  return (
    <section id="contact" className={styles.section} ref={ref}>
      <div className={styles.inner} ref={ref}>
        <motion.p
          className={styles.label}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          04. &gt; get_in_touch
        </motion.p>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Contact
        </motion.h2>
        <div className={styles.divider} />

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className={styles.cardInner}>
            <div className={styles.textSide}>
              <h3 className={styles.headline}>Let's Build Something<br /><span className={styles.headlineAccent}>Together</span></h3>
              <p className={styles.desc}>
                I'm open to collaborations, freelance projects, internships, and opportunities.
                Whether you have a project in mind or just want to connect — my inbox is always open.
              </p>
              <div className={styles.links}>
                <a
                  href={CONTACT.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <div>
                    <span className={styles.linkLabel}>GitHub</span>
                    <span className={styles.linkValue}>github.com/kenjaxx</span>
                  </div>
                </a>
              </div>
            </div>

            <div className={styles.terminalSide}>
              <div className={styles.terminal}>
                <div className={styles.termHeader}>
                  <span className={styles.dot} style={{ background: '#ff5f57' }} />
                  <span className={styles.dot} style={{ background: '#febc2e' }} />
                  <span className={styles.dot} style={{ background: '#28c840' }} />
                  <span className={styles.termTitle}>terminal</span>
                </div>
                <div className={styles.termBody}>
                  <p><span className={styles.prompt}>$ </span><span className={styles.cmd}>whoami</span></p>
                  <p className={styles.output}>kenji_ermita — full_stack_dev</p>
                  <p><span className={styles.prompt}>$ </span><span className={styles.cmd}>cat skills.txt</span></p>
                  <p className={styles.output}>React · Java · Python · Supabase</p>
                  <p><span className={styles.prompt}>$ </span><span className={styles.cmd}>echo $STATUS</span></p>
                  <p className={styles.output} style={{ color: 'var(--green)' }}>open_to_opportunities</p>
                  <p><span className={styles.prompt}>$ </span><span className={styles.cmd}>git log --oneline -1</span></p>
                  <p className={styles.output}>a1b2c3d building the future...</p>
                  <p className={styles.cursorLine}>
                    <span className={styles.prompt}>$ </span>
                    <span className={styles.termCursor}>▋</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
