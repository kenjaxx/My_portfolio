import { FaGithub } from 'react-icons/fa'
import { CONTACT } from '../data'
import styles from './Footer.module.css'

const GITHUB_LABEL = CONTACT.github.replace(/^https?:\/\//, '')

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <span className={styles.bracket}>&lt;</span>KE<span className={styles.bracket}> /&gt;</span>
        </div>
        <p className={styles.copy}>
          Designed &amp; built by <span className={styles.name}>Kenji Ermita</span> —{' '}
          {new Date().getFullYear()}
        </p>
        <a
          href={CONTACT.github}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-btn glass-btn--sm glass-btn--mono"
        >
          <FaGithub size={16} aria-hidden="true" />
          {GITHUB_LABEL}
        </a>
      </div>
    </footer>
  )
}