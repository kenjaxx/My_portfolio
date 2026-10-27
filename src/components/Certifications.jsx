import { useState, useMemo, useRef, useEffect, useCallback, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { CERTIFICATIONS, CERT_FILTERS } from '../data'
import styles from './Certifications.module.css'

// Lazy chunk (it pulls in gsap), so it stays out of the first paint.
const DepthCarousel = lazy(() => import('./DepthCarousel'))

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const onChange = () => setMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return mobile
}

export default function Certifications() {
  const [ref, inView] = useInView()
  const [activeKey, setActiveKey] = useState(CERT_FILTERS[0].key)
  const [activeIndex, setActiveIndex] = useState(0)
  const isMobile = useIsMobile()
  const tabRefs = useRef({})

  const visible = useMemo(
    () =>
      activeKey === 'all'
        ? CERTIFICATIONS
        : CERTIFICATIONS.filter((cert) => cert.category === activeKey),
    [activeKey]
  )

  // Rebuilt only when the filter changes, so the carousel isn't reset by other renders.
  const items = useMemo(
    () =>
      visible.map((cert) => ({
        image: cert.image,
        alt: `${cert.title} certificate from ${cert.issuer}`,
      })),
    [visible]
  )

  const current = visible[Math.min(activeIndex, visible.length - 1)]

  const countFor = (key) =>
    key === 'all' ? CERTIFICATIONS.length : CERTIFICATIONS.filter((c) => c.category === key).length

  const selectFilter = useCallback((key) => {
    setActiveKey(key)
    setActiveIndex(0)
  }, [])

  const handleChange = useCallback((index) => setActiveIndex(index), [])

  // Arrow keys / Home / End move between tabs (roving tabindex pattern).
  const handleTabKeyDown = (event, index) => {
    const last = CERT_FILTERS.length - 1
    let next
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    else return

    event.preventDefault()
    const filter = CERT_FILTERS[next]
    selectFilter(filter.key)
    tabRefs.current[filter.key]?.focus()
  }

  return (
    <section id="certifications" className={styles.section} ref={ref}>
      <div className={styles.inner}>
        <motion.p
          className={styles.label}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          &gt; certifications
        </motion.p>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Certifications
        </motion.h2>

        <motion.div
          className={styles.tabs}
          role="tablist"
          aria-label="Certification categories"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {CERT_FILTERS.map((filter, index) => {
            const selectedTab = activeKey === filter.key
            return (
              <button
                key={filter.key}
                ref={(el) => {
                  tabRefs.current[filter.key] = el
                }}
                id={`certs-tab-${filter.key}`}
                role="tab"
                type="button"
                aria-selected={selectedTab}
                aria-controls="certs-panel"
                tabIndex={selectedTab ? 0 : -1}
                className={`glass-btn glass-btn--sm glass-btn--grow ${
                  selectedTab ? 'is-active' : 'glass-btn--quiet'
                }`}
                onClick={() => selectFilter(filter.key)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
              >
                {filter.label}
                <span className={styles.tabCount}>{countFor(filter.key)}</span>
              </button>
            )
          })}
        </motion.div>

        <div
          id="certs-panel"
          role="tabpanel"
          aria-labelledby={`certs-tab-${activeKey}`}
          className={styles.panel}
        >
          {/* Mounted once the section is visible, so the carousel chunk (and gsap)
              isn't touched while the visitor is still at the top. The key restarts
              the carousel at the first card whenever the filter changes. */}
          <div className={styles.stage}>
            {inView && (
              <Suspense fallback={null}>
                <DepthCarousel
                  key={activeKey}
                  items={items}
                  cardWidth={isMobile ? 340 : 520}
                  cardHeight={isMobile ? 240 : 366}
                  radius={14}
                  depth={200}
                  spread={80}
                  tilt={20}
                  tiltDirection="right"
                  perspective={1400}
                  visibleCards={3}
                  falloff={0.22}
                  blur={4}
                  autoplay={false}
                  loop
                  onChange={handleChange}
                />
              </Suspense>
            )}
          </div>

          <div className={styles.info} aria-live="polite">
            {current && (
              <motion.div
                key={current.id}
                className={styles.infoInner}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className={styles.issuer}>{current.issuer}</p>
                <h3 className={styles.certTitle}>{current.title}</h3>
                <p className={styles.meta}>
                  <span>{current.date}</span>
                  {current.credentialId && <span>ID: {current.credentialId}</span>}
                  <span>
                    {Math.min(activeIndex, visible.length - 1) + 1} / {visible.length}
                  </span>
                </p>
                {current.detail && <p className={styles.detail}>{current.detail}</p>}

                <div className={`glass-group ${styles.actions}`}>
                  {current.verify && (
                    <a
                      href={current.verify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-btn glass-btn--sm glass-btn--accent"
                    >
                      Verify credential
                      <span className="glass-btn__arrow" aria-hidden="true">
                        →
                      </span>
                    </a>
                  )}
                  <a
                    href={current.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn glass-btn--sm glass-btn--mono"
                  >
                    View full size
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <p className={styles.hint}>Drag, swipe or use the arrow keys to browse</p>
      </div>
    </section>
  )
}