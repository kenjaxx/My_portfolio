import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { CONTACT } from '../data'
import styles from './Contact.module.css'

/*
  Career timeline, read top to bottom.
  done: true  -> gradient circle with a check mark
  done: false -> glowing green "current" dot, no check mark
*/
const TIMELINE = [
  {
    id: 'internship',
    eyebrow: '2026',
    title: 'Internship (OJT)',
    text: 'IT Intern at Knowles Training Institute, remote, Singapore.',
    done: true,
  },
  {
    id: 'graduate',
    eyebrow: 'Education',
    title: "Graduate, Bachelor's degree",
    text: 'BS Information Technology, Cebu Institute of Technology, University.',
    done: true,
  },
  {
    id: 'apps',
    eyebrow: 'Projects',
    title: 'Four live apps',
    text: 'Billify, Shoecommerce, Closet, and House Selling Site.',
    done: true,
  },
  {
    id: 'now',
    eyebrow: 'Now',
    title: 'Open to opportunities',
    text: 'Open to work, freelance opportunities, and exciting collaborations.',
    done: false,
  },
]

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.35 + i * 0.15, duration: 0.5, ease: 'easeOut' },
  }),
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.11 20.45H3.56V9h3.55v11.45z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export default function Contact() {
  const [ref, inView] = useInView()

  return (
    // Keep id="contact" so the navbar link and scroll-spy keep working.
    <section id="contact" className={styles.section} ref={ref}>
      <div className={styles.inner}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.label}>&gt; get_in_touch</p>
          <h2 className={styles.title}>Contact me</h2>

          <div className={styles.grid}>
            {/* ---------- Left: intro + secondary contact links ---------- */}
            <div className={styles.textSide}>
              <h3 className={styles.headline}>
                Reach out,{' '}
                <span className={styles.headlineAccent}>let's talk</span>
              </h3>
              <p className={styles.desc}>
                I'm open to freelance projects, internships, and collaborations.
                Send me an email and I'll reply within 24 hours.
              </p>

              {CONTACT.email && (
                <div>
                  <p className={styles.reach}>Email me at</p>
                  <p className={styles.email}>
                    <MailIcon />
                    {CONTACT.email}
                  </p>
                </div>
              )}

              {(CONTACT.linkedin || CONTACT.github) && (
                <div>
                  <p className={styles.reach}>Or find me online</p>
                  <div className={styles.links}>
                    {CONTACT.linkedin && (
                      <a
                        href={CONTACT.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contactLink}
                      >
                        <LinkedInIcon />
                        LinkedIn
                      </a>
                    )}
                    {CONTACT.github && (
                      <a
                        href={CONTACT.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contactLink}
                      >
                        <GitHubIcon />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ---------- Right: career timeline ---------- */}
            <div className={styles.panel}>
              <h4 className={styles.panelTitle}>Career timeline</h4>
              <p className={styles.panelSub}>Where I am and how I got here.</p>

              <ol className={styles.timeline}>
                {TIMELINE.map((item, i) => {
                  const isLastDone = item.done && !TIMELINE[i + 1]?.done
                  return (
                    <motion.li
                      key={item.id}
                      className={`${styles.item} ${isLastDone ? styles.toNow : ''}`}
                      variants={itemVariants}
                      custom={i}
                      initial="hidden"
                      animate={inView ? 'visible' : 'hidden'}
                    >
                      {item.done ? (
                        <span className={styles.check} aria-hidden="true">
                          <CheckIcon />
                        </span>
                      ) : (
                        <span className={styles.now} aria-hidden="true">
                          <span className={styles.nowDot} />
                        </span>
                      )}

                      <div className={styles.body}>
                        <span className={`${styles.eyebrow} ${item.done ? '' : styles.eyebrowNow}`}>
                          {item.eyebrow}
                        </span>
                        <h5 className={styles.itemTitle}>
                          <span className={styles.srOnly}>
                            {item.done ? 'Completed: ' : 'Current: '}
                          </span>
                          {item.title}
                        </h5>
                        <p className={styles.itemText}>{item.text}</p>
                      </div>
                    </motion.li>
                  )
                })}
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}