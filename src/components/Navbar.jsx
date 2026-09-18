import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_LINKS } from '../data'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeHref, setActiveHref] = useState(NAV_LINKS[0]?.href ?? '')
  const navRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll-spy: highlight whichever section is currently most visible
  // in the viewport, so the nav reflects where the visitor actually is,
  // not just the last link they clicked.
  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.querySelector(link.href)).filter(
      Boolean
    )
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the intersecting entry closest to the top of the viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveHref(`#${visible[0].target.id}`)
        }
      },
      {
        // Treat a section as "active" once it crosses the upper third of
        // the viewport, and stop tracking it once it leaves the lower third.
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0,
      }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const handleNav = (href) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      ref={navRef}
      className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div
        className={styles.logo}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      >
        <span className={styles.logoBracket}>&lt;</span>
        KE
        <span className={styles.logoBracket}> /&gt;</span>
      </div>

      <ul className={styles.links}>
        {NAV_LINKS.map((link, i) => (
          <motion.li
            key={link.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.3 }}
          >
            <button
              onClick={() => handleNav(link.href)}
              className={`${styles.link} ${activeHref === link.href ? styles.linkActive : ''}`}
              aria-current={activeHref === link.href ? 'true' : undefined}
            >
              <span className={styles.linkNum}>0{i + 1}.</span>
              {link.label}
            </button>
          </motion.li>
        ))}
      </ul>

      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className={menuOpen ? styles.barOpen : styles.bar} />
        <span className={menuOpen ? styles.barOpenMid : styles.bar} />
        <span className={menuOpen ? styles.barOpenBot : styles.bar} />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {NAV_LINKS.map((link, i) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className={`${styles.mobileLink} ${activeHref === link.href ? styles.mobileLinkActive : ''}`}
                aria-current={activeHref === link.href ? 'true' : undefined}
              >
                <span className={styles.linkNum}>0{i + 1}.</span> {link.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}