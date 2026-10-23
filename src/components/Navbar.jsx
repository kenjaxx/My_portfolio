import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_LINKS, CONTACT } from '../data'
import { getDeviceTier } from '../utils/deviceTier'
import styles from './Navbar.module.css'

// Read once at module load. Weak devices get a solid bar instead of the blur.
const tier = getDeviceTier()

// Length of the one-off spotlight sweep in Navbar.module.css (8s), plus a hair.
const INTRO_MS = 8100

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  // Empty string = hero / top of page, so no link is highlighted there.
  const [activeHref, setActiveHref] = useState('')
  // True while the one-off spotlight sweep is playing.
  const [intro, setIntro] = useState(true)
  const wrapRef = useRef(null)
  const pillRef = useRef(null)

  // The sweep only plays once after load. After that the light rests at the
  // top centre of the pill until a mouse hovers it.
  useEffect(() => {
    const id = setTimeout(() => setIntro(false), INTRO_MS)
    return () => clearTimeout(id)
  }, [])

  // Scrolled style + the two edge cases the observer can't catch:
  // back at the top (nothing active) and at the very bottom (last link active).
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)

      if (y < 100) {
        setActiveHref('')
      } else if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) {
        setActiveHref(NAV_LINKS[NAV_LINKS.length - 1].href)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll-spy: highlight the section currently in the middle of the viewport.
  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.querySelector(link.href)).filter(Boolean)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveHref(`#${visible[0].target.id}`)
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const handlePointerMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const pill = pillRef.current
    if (!pill) return
    // Hovering takes over from the intro sweep. (React skips the re-render
    // when the value is already false, so this is free on later moves.)
    setIntro(false)
    pill.dataset.hover = 'true'
    const rect = pill.getBoundingClientRect()
    pill.style.setProperty('--x', `${e.clientX - rect.left}px`)
    pill.style.setProperty('--y', `${e.clientY - rect.top}px`)
  }

  const handlePointerLeave = () => {
    const pill = pillRef.current
    if (!pill) return
    delete pill.dataset.hover
    // Hand control back to the CSS: the light glides to its resting spot.
    pill.style.removeProperty('--x')
    pill.style.removeProperty('--y')
  }

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  // Close the mobile menu when clicking outside the nav.
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
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

  const scrollTop = () => {
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <motion.header
      className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}
      data-lite={tier.lowPower ? 'true' : undefined}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className={styles.wrap} ref={wrapRef}>
        {/* ---------- The floating glass pill with spotlight border ---------- */}
        <nav
          ref={pillRef}
          className={`${styles.pill} ${intro ? styles.pillIntro : ''} ${
            scrolled ? styles.pillScrolled : ''
          }`}
          aria-label="Primary"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <div className={styles.pillInner}>
            <button
              type="button"
              className={styles.logo}
              onClick={scrollTop}
              aria-label="Back to top"
            >
              <span className={styles.logoBracket}>&lt;</span>
              KE
              <span className={styles.logoBracket}> /&gt;</span>
            </button>

            <ul className={styles.links}>
              {NAV_LINKS.map((link) => {
                const active = activeHref === link.href
                return (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={() => handleNav(link.href)}
                      className={`${styles.link} ${active ? styles.linkActive : ''}`}
                      aria-current={active ? 'true' : undefined}
                    >
                      {/* Shared-layout highlight: slides between links as you scroll */}
                      {active && (
                        <motion.span
                          layoutId="nav-active-pill"
                          className={styles.activePill}
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className={styles.linkLabel}>{link.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            {CONTACT.resume && (
              <a
                href={CONTACT.resume}
                download
                className="glass-btn glass-btn--sm glass-btn--desktop"
              >
                Resume
              </a>
            )}

            <button
              type="button"
              className={styles.hamburger}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span className={menuOpen ? styles.barOpen : styles.bar} />
              <span className={menuOpen ? styles.barOpenMid : styles.bar} />
              <span className={menuOpen ? styles.barOpenBot : styles.bar} />
            </button>
          </div>
        </nav>

        {/* ---------- Mobile dropdown (sibling of the pill so its blur works) ---------- */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              className={styles.mobileMenu}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {NAV_LINKS.map((link) => {
                const active = activeHref === link.href
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleNav(link.href)}
                    className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ''}`}
                    aria-current={active ? 'true' : undefined}
                  >
                    {link.label}
                  </button>
                )
              })}
              {CONTACT.resume && (
                <a
                  href={CONTACT.resume}
                  download
                  className="glass-btn glass-btn--block"
                  style={{ marginTop: '0.3rem' }}
                >
                  Resume
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}