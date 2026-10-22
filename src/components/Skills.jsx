import { useState, useMemo, useRef, useEffect, useCallback, memo, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { SKILL_GROUPS } from '../data'
import { SKILL_ICONS } from '../skillIcons'
import { LEVELS, STATUS, getSkillInfo, getProjectsFor } from '../skillInfo'
import Modal from './Modal'
import styles from './Skills.module.css'

// Lazy chunk, memoised so opening/closing the popup doesn't re-render the grid.
const Glass = memo(lazy(() => import('./GlassIcons')))

/* ---------- Color helpers: skill color -> glass plate gradient ---------- */

const WHITE = [255, 255, 255]
const BLACK = [0, 0, 0]
const GRAPHITE = 'linear-gradient(135deg, hsl(250, 6%, 46%), hsl(250, 8%, 22%))'

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const luminance = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
const css = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`

const gradientCache = new Map()

function plateGradient(hex) {
  const key = hex || '#00d4ff'
  if (gradientCache.has(key)) return gradientCache.get(key)

  const rgb = hexToRgb(key)
  const lum = luminance(rgb)
  let result

  if (lum > 0.9) {
    // Near-white brands (Next.js, GitHub, Vercel): a white icon on a white
    // plate would vanish, so they get a graphite plate instead.
    result = GRAPHITE
  } else {
    let from
    let to
    if (lum < 0.14) {
      from = mix(rgb, WHITE, 0.38)
      to = mix(rgb, WHITE, 0.12)
    } else if (lum > 0.6) {
      from = mix(rgb, BLACK, 0.08)
      to = mix(rgb, BLACK, 0.38)
    } else {
      from = mix(rgb, WHITE, 0.2)
      to = mix(rgb, BLACK, 0.22)
    }
    result = `linear-gradient(135deg, ${css(from)}, ${css(to)})`
  }

  gradientCache.set(key, result)
  return result
}

/* Accent color for the meter and bars in the popup. */
const accentOf = (hex) => (hex && luminance(hexToRgb(hex)) < 0.12 ? '#6ee7b7' : hex || '#00d4ff')

/* ---------- Small hooks ---------- */

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

/* ---------- The skill popup ---------- */

function SkillModal({ selected, onClose }) {
  const skill = selected?.skill
  const Icon = selected?.Icon
  const info = skill ? getSkillInfo(skill.name) : null
  const status = info ? STATUS[info.status] || STATUS.familiar : null
  const projects = skill ? getProjectsFor(skill.name) : []

  const goToProjects = () => {
    onClose()
    setTimeout(() => {
      document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
    }, 60)
  }

  return (
    <Modal
      open={Boolean(selected)}
      onClose={onClose}
      label={skill ? `${skill.name} skill details` : 'Skill details'}
      origin={selected ? { dx: selected.dx, dy: selected.dy } : undefined}
      overlayClassName={styles.overlay}
      panelClassName={styles.detail}
      closeClassName={styles.closeBtn}
      closeLabel="Close skill details"
      panelStyle={{ '--skill-color': accentOf(skill?.color) }}
    >
      {skill && (
        <>
          <div className={styles.head}>
            <span className={styles.iconTile} style={{ background: plateGradient(skill.color) }}>
              {Icon && <Icon aria-hidden="true" />}
            </span>
            <div className={styles.headText}>
              <h3 className={styles.skillName}>{skill.name}</h3>
              <span className={styles.badge} style={{ '--badge': status.color }}>
                <span className={styles.badgeDot} />
                {status.label}
              </span>
            </div>
          </div>

          <div className={styles.levelRow}>
            <span className={styles.levelName}>{LEVELS[info.level]}</span>
            <span className={styles.levelNum}>{info.level} / 5</span>
          </div>
          <div
            className={styles.meter}
            role="img"
            aria-label={`${LEVELS[info.level]}, level ${info.level} of 5`}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`${styles.seg} ${n <= info.level ? styles.segOn : ''}`}
                style={{ animationDelay: `${0.25 + n * 0.07}s` }}
              />
            ))}
          </div>

          {info.blurb && <p className={styles.blurb}>{info.blurb}</p>}

          {info.subs && info.subs.length > 0 && (
            <div className={styles.block}>
              <p className={styles.blockTitle}>Breakdown</p>
              <div className={styles.subs}>
                {info.subs.map((s, i) => (
                  <div key={s.name} className={styles.sub}>
                    <div className={styles.subTop}>
                      <span>{s.name}</span>
                      <span className={styles.subNum}>{s.value}/5</span>
                    </div>
                    <div className={styles.track}>
                      <span
                        className={styles.fill}
                        style={{ '--v': s.value, animationDelay: `${0.35 + i * 0.08}s` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div className={styles.block}>
              <p className={styles.blockTitle}>Used in</p>
              <div className={styles.chips}>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.projChip}
                    onClick={goToProjects}
                    title="Jump to the Projects section"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

/* ---------- Section ---------- */

export default function Skills() {
  const [ref, inView] = useInView()
  const [activeKey, setActiveKey] = useState(SKILL_GROUPS[0]?.key)
  const [selected, setSelected] = useState(null)
  const isMobile = useIsMobile()
  const tabRefs = useRef({})

  const activeGroup = SKILL_GROUPS.find((g) => g.key === activeKey) ?? SKILL_GROUPS[0]

  const handlePick = useCallback((skill, event) => {
    const Icon = SKILL_ICONS[skill.name]
    // Keyboard activation has no pointer position, so grow from the centre.
    const hasPointer = event && (event.clientX || event.clientY)
    const dx = hasPointer ? event.clientX - window.innerWidth / 2 : 0
    const dy = hasPointer ? event.clientY - window.innerHeight / 2 : 0
    setSelected({ skill, Icon, dx, dy })
  }, [])

  const closeModal = useCallback(() => setSelected(null), [])

  // Arrow keys / Home / End move between tabs (roving tabindex pattern).
  const handleTabKeyDown = (event, index) => {
    const last = SKILL_GROUPS.length - 1
    let next
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    else return

    event.preventDefault()
    const group = SKILL_GROUPS[next]
    setActiveKey(group.key)
    tabRefs.current[group.key]?.focus()
  }

  // Rebuilt only when the tab changes, so the glass grid stays still while
  // the popup opens and closes.
  const items = useMemo(
    () =>
      activeGroup.skills.map((skill) => {
        const Icon = SKILL_ICONS[skill.name]
        return {
          id: skill.name,
          label: skill.name,
          color: plateGradient(skill.color),
          icon: Icon ? <Icon /> : null,
          onClick: (event) => handlePick(skill, event),
        }
      }),
    [activeGroup, handlePick]
  )

  return (
    <section id="skills" className={styles.section} ref={ref}>
      <div className={styles.inner}>
        <motion.p
          className={styles.label}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          &gt; tech_stack
        </motion.p>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Skills & Tools
        </motion.h2>

        <motion.div
          className={styles.tabs}
          role="tablist"
          aria-label="Skill categories"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {SKILL_GROUPS.map((group, index) => {
            const selectedTab = activeKey === group.key
            return (
              <button
                key={group.key}
                ref={(el) => {
                  tabRefs.current[group.key] = el
                }}
                id={`skills-tab-${group.key}`}
                role="tab"
                type="button"
                aria-selected={selectedTab}
                aria-controls="skills-panel"
                tabIndex={selectedTab ? 0 : -1}
                className={`${styles.tab} ${selectedTab ? styles.tabActive : ''}`}
                onClick={() => setActiveKey(group.key)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
              >
                {group.label}
                <span className={styles.tabCount}>{group.skills.length}</span>
              </button>
            )
          })}
        </motion.div>

        <div
          id="skills-panel"
          role="tabpanel"
          aria-labelledby={`skills-tab-${activeGroup.key}`}
          tabIndex={0}
          className={styles.glassWrap}
        >
          {/* Mounted once the section is visible, so the WebGL glass (and its
              chunk) isn't created while the visitor is still at the top. */}
          {inView && (
            <Suspense fallback={null}>
              <Glass
                items={items}
                size={isMobile ? 56 : 64}
                gap={isMobile ? 30 : 44}
                columns={7}
                roundness={0.6}
                refraction={0.8}
                bevel={0.6}
                dispersion={0}
                frost={0.2}
                shine={0.85}
                tint="#dfdfdf"
                tintOpacity={0.2}
                iconColor="#ffffff"
                plate="tilt"
                tilt={30}
                spread={0.5}
                hover="press"
                parallax={1}
                labels="always"
                intro
                theme="dark"
              />
            </Suspense>
          )}
        </div>

        <p className={styles.hint}>Click a tile to see how well I know it</p>
      </div>

      <SkillModal selected={selected} onClose={closeModal} />
    </section>
  )
}