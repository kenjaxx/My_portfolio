import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { PROJECTS } from '../data'
import styles from './Projects.module.css'

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export default function Projects() {
  const [ref, inView] = useInView()

  return (
    <section id="projects" className={styles.section} ref={ref}>
      <div className={styles.inner}>
        <motion.p
          className={styles.label}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          03. &gt; my_work
        </motion.p>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Projects
        </motion.h2>
        <div className={styles.divider} />

        <div className={styles.grid}>
          {PROJECTS.map((project, i) => (
            <motion.div
              key={project.id}
              className={`${styles.card} ${project.featured ? styles.featured : ''}`}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 + 0.2, duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              {/* Cover image */}
              {project.image && (
                <div className={styles.coverWrap}>
                  <img src={project.image} alt={project.title} className={styles.cover} />
                  <div className={styles.coverOverlay} />
                </div>
              )}

              <div className={styles.cardBody}>
                {project.featured && <div className={styles.featuredBadge}>Featured</div>}

                <div className={styles.cardTop}>
                  <span className={styles.num}># {project.id}</span>
                  <div className={styles.links}>
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className={styles.iconLink} title="GitHub">
                        <GitHubIcon />
                      </a>
                    )}
                    {project.live && (
                      <a href={project.live} target="_blank" rel="noopener noreferrer" className={styles.iconLink} title="Live Demo">
                        <ExternalIcon />
                      </a>
                    )}
                  </div>
                </div>

                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.projectDesc}>{project.description}</p>

                <div className={styles.tags}>
                  {project.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>

                {project.live && (
                  <a href={project.live} target="_blank" rel="noopener noreferrer" className={styles.liveBtn}>
                    View Live <ExternalIcon />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.moreWrap}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <a href="https://github.com/kenjaxx" target="_blank" rel="noopener noreferrer" className={styles.moreLink}>
            <GitHubIcon />
            See more on GitHub →
          </a>
        </motion.div>
      </div>
    </section>
  )
}