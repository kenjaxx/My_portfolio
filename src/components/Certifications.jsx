import { useState, useMemo, useRef, useEffect, useCallback, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { CERTIFICATIONS, CERT_FILTERS } from '../data'
import Modal from './Modal'
import styles from './Certifications.module.css'

// Lazy chunk (it pulls in gsap), so it stays out of the first paint.
const DepthCarousel = lazy(() => import('./DepthCarousel'))

// The carousel uses a smaller copy of each certificate ("name.webp", made by
// scripts/optimize-certs.mjs). The big "name-full.webp" is only loaded by the
// "View full size" viewer, and as a fallback if the small copy is missing.
const thumbOf = (src) => src.replace(/-full\.webp$/, '.webp')

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

function ArrowIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Certifications() {
  const [ref, inView] = useInView()
  const [activeKey, setActiveKey] = useState(CERT_FILTERS[0].key)
  const [activeIndex, setActiveIndex] = useState(0)

  // Lightbox state. `viewerIndex` is the cert shown in the lightbox, which can
  // move away from the carousel while it is open. The carousel catches up on close.
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [viewerOrigin, setViewerOrigin] = useState({ dx: 0, dy: 0 })

  const isMobile = useIsMobile()
  const tabRefs = useRef({})
  const carouselRef = useRef(null)

  const visible = useMemo(
    () =>
      activeKey === 'all'
        ? CERTIFICATIONS
        : CERTIFICATIONS.filter((cert) => cert.category === activeKey),
    [activeKey]
  )

  // Rebuilt only when the filter changes, so the carousel isn't reset by other renders.
  // `image` is the small copy; `fallback` is the full-size file, used only if the
  // small one fails to load.
  const items = useMemo(
    () =>
      visible.map((cert) => ({
        image: thumbOf(cert.image),
        fallback: cert.image,
        alt: `${cert.title} certificate from ${cert.issuer}`,
      })),
    [visible]
  )

  const total = visible.length
  const safeActive = Math.min(activeIndex, total - 1)
  const current = visible[safeActive]
  const viewerCert = visible[Math.min(viewerIndex, total - 1)]

  const countFor = (key) =>
    key === 'all' ? CERTIFICATIONS.length : CERTIFICATIONS.filter((c) => c.category === key).length

  const selectFilter = useCallback((key) => {
    setActiveKey(key)
    setActiveIndex(0)
  }, [])

  const handleChange = useCallback((index) => setActiveIndex(index), [])

  const openViewer = useCallback(
    (event) => {
      // Keyboard activation has no pointer position, so grow from the centre.
      const hasPointer = event && (event.clientX || event.clientY)
      setViewerOrigin({
        dx: hasPointer ? event.clientX - window.innerWidth / 2 : 0,
        dy: hasPointer ? event.clientY - window.innerHeight / 2 : 0,
      })
      setViewerIndex(safeActive)
      setViewerOpen(true)
    },
    [safeActive]
  )

  // On close, move the carousel to whichever cert was last shown in the viewer.
  const closeViewer = useCallback(() => {
    setViewerOpen(false)
    if (viewerIndex !== safeActive) carouselRef.current?.goTo(viewerIndex)
  }, [viewerIndex, safeActive])

  const showNext = useCallback(() => {
    if (total < 2) return
    setViewerIndex((i) => (i + 1) % total)
  }, [total])

  const showPrev = useCallback(() => {
    if (total < 2) return
    setViewerIndex((i) => (i - 1 + total) % total)
  }, [total])

  // Left / Right arrow keys flip through certificates while the viewer is open.
  useEffect(() => {
    if (!viewerOpen) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        showNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        showPrev()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [viewerOpen, showNext, showPrev])

  // Preload the neighbours so flipping feels instant.
  useEffect(() => {
    if (!viewerOpen || total < 2) return
    ;[1, -1].forEach((step) => {
      const cert = visible[(viewerIndex + step + total) % total]
      if (cert) {
        const img = new Image()
        img.src = cert.image
      }
    })
  }, [viewerOpen, viewerIndex, visible, total])

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

        {/* Tabs, then the action for the card in front, both centred. */}
        <motion.div
          className={styles.toolbar}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div className={styles.tabs} role="tablist" aria-label="Certification categories">
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
          </div>

          {current && (
            <div className={`glass-group ${styles.actions}`}>
              <button
                type="button"
                className="glass-btn glass-btn--sm glass-btn--accent"
                onClick={openViewer}
              >
                View full size
                <span aria-hidden="true">⤢</span>
              </button>
            </div>
          )}
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
                  ref={carouselRef}
                  items={items}
                  cardWidth={isMobile ? 300 : 680}
                  cardHeight={isMobile ? 211 : 479}
                  radius={14}
                  depth={isMobile ? 140 : 220}
                  spread={isMobile ? 40 : 90}
                  tilt={20}
                  tiltDirection="right"
                  perspective={1600}
                  visibleCards={3}
                  falloff={0.22}
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
                    {safeActive + 1} / {total}
                  </span>
                </p>
                {current.detail && <p className={styles.detail}>{current.detail}</p>}
              </motion.div>
            )}
          </div>
        </div>

        <p className={styles.hint}>Drag, swipe or use the arrow keys to browse</p>
      </div>

      {/* Full-size viewer. Stays on the page, so closing it always brings you back.
          The arrows let you flip through every certificate without leaving it. */}
      <Modal
        open={viewerOpen && Boolean(viewerCert)}
        onClose={closeViewer}
        label={viewerCert ? `${viewerCert.title} certificate, full size` : 'Certificate'}
        origin={viewerOrigin}
        overlayClassName={styles.viewerOverlay}
        panelClassName={styles.viewerPanel}
        closeClassName="glass-btn glass-btn--icon glass-btn--corner"
        closeLabel="Close full size view"
      >
        {viewerCert && (
          <>
            <p className={styles.viewerTitle}>
              {viewerCert.title}
              <span className={styles.viewerCount}>
                {' '}
                · {Math.min(viewerIndex, total - 1) + 1} / {total}
              </span>
            </p>

            <div className={styles.viewerStage}>
              <img
                key={viewerCert.id}
                className={styles.viewerImg}
                src={viewerCert.image}
                alt={`${viewerCert.title} certificate from ${viewerCert.issuer}`}
                decoding="async"
              />

              {total > 1 && (
                <>
                  <button
                    type="button"
                    className={`glass-btn glass-btn--icon ${styles.viewerNav} ${styles.viewerPrev}`}
                    onClick={showPrev}
                    aria-label="Previous certificate"
                  >
                    <ArrowIcon direction="left" />
                  </button>
                  <button
                    type="button"
                    className={`glass-btn glass-btn--icon ${styles.viewerNav} ${styles.viewerNext}`}
                    onClick={showNext}
                    aria-label="Next certificate"
                  >
                    <ArrowIcon direction="right" />
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </section>
  )
}