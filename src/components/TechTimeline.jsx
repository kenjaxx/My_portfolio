import { useEffect, useRef, useState } from 'react'
import {
  FaReact,
  FaPython,
  FaJava,
  FaHtml5,
  FaCss3Alt,
  FaNodeJs,
  FaGitAlt,
  FaAws,
  FaDatabase,
  FaCode,
  FaJs,
} from 'react-icons/fa'
import { TIMELINE_SKILLS } from '../data'
import styles from './TechTimeline.module.css'

const ICONS = {
  JavaScript: FaJs,
  TypeScript: FaCode,
  Python: FaPython,
  Java: FaJava,
  HTML: FaHtml5,
  CSS: FaCss3Alt,
  SQL: FaDatabase,
  React: FaReact,
  'Node.js': FaNodeJs,
  Supabase: FaDatabase,
  Git: FaGitAlt,
  AWS: FaAws,
}

const OFFSETS = [6, 34, 14, 46, 4, 28, 42, 10, 22, 48, 8, 36]

/* ---- Tuning knobs (all in pixels per second unless noted) ---- */
const COPIES = 3 // repeats of the skill list so the rail never runs out
const RAIL_SPEED = 24 // how fast the badges drift left
const BASE_SPEED = 60 // the rocket's normal speed, moving right
const BOOST = 200 // extra speed the rocket gets on a hit
const BOOST_DECAY = 2.5 // higher = the boost fades faster
const HIT_RADIUS = 12 // how close (px) the rocket must be to "touch" a badge

function Node({ skill, index, lit, setRef }) {
  const Icon = ICONS[skill.name]
  const offset = OFFSETS[index % OFFSETS.length]

  return (
    <div
      ref={setRef}
      className={`${styles.node} ${lit ? styles.active : ''}`}
      style={{ '--offset': `${offset}px`, '--skill-color': skill.color }}
    >
      <div className={styles.badge}>
        {Icon && <Icon className={styles.badgeIcon} style={{ color: skill.color }} />}
        <span>{skill.name}</span>
      </div>
      <div className={styles.dot} />
      <div className={styles.stem} />
    </div>
  )
}

function Rocket() {
  return (
    <div className={styles.rocket}>
      <div className={styles.flame} />
      <svg
        className={styles.rocketBody}
        width="28"
        height="14"
        viewBox="0 0 28 14"
        aria-hidden="true"
      >
        <path d="M6 3 L1 0 L11 3 Z" fill="#7c3aed" />
        <path d="M6 11 L1 14 L11 11 Z" fill="#7c3aed" />
        <path d="M1 4 H16 Q22 4 27 7 Q22 10 16 10 H1 Z" fill="#e2e8f0" />
        <rect x="0" y="5" width="3" height="4" rx="1" fill="#94a3b8" />
        <circle cx="15" cy="7" r="2.3" fill="#00d4ff" />
        <circle cx="14.4" cy="6.4" r="0.8" fill="#ffffff" />
      </svg>
    </div>
  )
}

export default function TechTimeline() {
  const n = TIMELINE_SKILLS.length
  const loopedSkills = Array.from({ length: COPIES }, () => TIMELINE_SKILLS).flat()

  // Index (in the looped list) of the badge the rocket touched most recently.
  const [activeKey, setActiveKey] = useState(null)

  const wrapRef = useRef(null)
  const counterRef = useRef(null)
  const railRef = useRef(null)
  const sparkRef = useRef(null)
  const pathRef = useRef(null)
  const nodeRefs = useRef([])
  const activeRef = useRef(null) // mirror of activeKey for the animation loop

  useEffect(() => {
    const wrap = wrapRef.current
    const rail = railRef.current
    const spark = sparkRef.current
    const counter = counterRef.current
    const path = pathRef.current
    const nodes = nodeRefs.current
    if (!wrap || !rail || !spark || !counter || !path) return

    // Reduced motion: no moving parts, just show the first skill lit.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      activeRef.current = 0
      setActiveKey(0)
      return
    }

    const s = {
      railX: 0,
      sparkX: 0,
      boost: 0,
      period: 0, // distance the rail travels before it repeats exactly
      width: 0,
      centers: [], // each badge's center x inside the rail
      badgeTops: [], // each badge's top edge, relative to the wrapper
      counterBottom: 0,
      hitKey: -1,
      raf: 0,
      last: 0,
      visible: true,
      pathOn: false,
    }

    // Everything the loop needs from the DOM is measured here, only when
    // the layout changes. offsetLeft/offsetTop ignore CSS transforms, so the
    // values stay correct even while a badge is scaled up.
    const measure = () => {
      s.width = wrap.clientWidth
      s.period = nodes[n].offsetLeft - nodes[0].offsetLeft
      s.centers = nodes.map((el) => el.offsetLeft + el.offsetWidth / 2)

      const railTop = rail.offsetParent.offsetTop + rail.offsetTop
      s.badgeTops = nodes.map((el) => railTop + el.offsetTop + el.firstElementChild.offsetTop - 2)
      s.counterBottom = counter.offsetTop + counter.offsetHeight + 4
    }

    const setPathVisible = (on) => {
      if (s.pathOn === on) return
      s.pathOn = on
      path.style.opacity = on ? '1' : '0'
    }

    const tick = (now) => {
      const dt = Math.min((now - s.last) / 1000, 0.05)
      s.last = now

      // --- rail drifts left, wrapping seamlessly by exactly one period ---
      s.railX -= RAIL_SPEED * dt
      if (s.period && s.railX <= -s.period) {
        s.railX += s.period
        // Every badge is now drawn where the one n places later used to be,
        // so shift the stored indices back by n to keep the right one lit.
        if (s.hitKey >= n) s.hitKey -= n
        if (activeRef.current !== null && activeRef.current >= n) {
          activeRef.current -= n
          setActiveKey(activeRef.current)
        }
      }
      rail.style.transform = `translate3d(${s.railX}px, 0, 0)`

      // --- rocket flies right; the boost from a hit decays back to normal ---
      s.boost *= Math.exp(-BOOST_DECAY * dt)
      if (s.boost < 1) s.boost = 0
      s.sparkX += (BASE_SPEED + s.boost) * dt
      if (s.sparkX > s.width + 60) s.sparkX = -60
      spark.style.transform = `translate3d(${s.sparkX}px, 0, 0)`
      spark.style.setProperty('--boost', (s.boost / BOOST).toFixed(3))

      // --- did the rocket touch a badge? ---
      for (let i = 0; i < nodes.length; i++) {
        const c = s.centers[i] + s.railX
        if (Math.abs(s.sparkX - c) <= HIT_RADIUS && s.hitKey !== i) {
          s.hitKey = i
          s.boost = BOOST
          activeRef.current = i
          setActiveKey(i)
          break
        }
      }

      // --- dashed connector: pure arithmetic, no layout reads ---
      const k = activeRef.current
      if (k !== null && s.badgeTops[k] !== undefined) {
        const x2 = s.centers[k] + s.railX
        if (x2 > 0 && x2 < s.width) {
          const x1 = s.width / 2 // the counter is centered in the wrapper
          const y1 = s.counterBottom
          const y2 = s.badgeTops[k]
          const mid = (y1 + y2) / 2
          path.setAttribute('d', `M${x1} ${y1} V${mid} H${x2.toFixed(1)} V${y2}`)
          setPathVisible(true)
        } else {
          setPathVisible(false)
        }
      } else {
        setPathVisible(false)
      }

      // Keep looping only while the strip is on screen and the tab is visible.
      s.raf = s.visible && !document.hidden ? requestAnimationFrame(tick) : 0
    }

    const start = () => {
      if (s.raf || !s.visible || document.hidden) return
      s.last = performance.now()
      s.raf = requestAnimationFrame(tick)
    }

    const stop = () => {
      cancelAnimationFrame(s.raf)
      s.raf = 0
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(rail)
    ro.observe(wrap)

    // Pause when scrolled out of view.
    const io = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting
      if (s.visible) start()
      else stop()
    })
    io.observe(wrap)

    // Pause when the browser tab is hidden.
    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    start()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [n])

  const activeSkill = activeKey === null ? null : TIMELINE_SKILLS[activeKey % n]
  const activeIndex = activeKey === null ? 0 : (activeKey % n) + 1

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.counter} ref={counterRef}>
        <span className={styles.counterIndex}>{String(activeIndex).padStart(2, '0')}</span>
        <span
          key={activeKey ?? 'idle'}
          className={styles.counterName}
          style={activeSkill ? { color: activeSkill.color } : undefined}
        >
          {activeSkill ? activeSkill.name : 'ready'}
        </span>
        <span className={styles.counterTag}>always learning</span>
      </div>

      {/* Connector line between the counter and the lit badge */}
      <svg className={styles.connector} aria-hidden="true">
        <path
          ref={pathRef}
          className={styles.connectorPath}
          style={{ stroke: activeSkill ? activeSkill.color : 'var(--cyan)' }}
        />
      </svg>

      <div className={styles.track}>
        <div className={styles.rail} ref={railRef}>
          {loopedSkills.map((skill, i) => (
            <Node
              key={`${skill.name}-${i}`}
              skill={skill}
              index={i}
              lit={i === activeKey}
              setRef={(el) => {
                nodeRefs.current[i] = el
              }}
            />
          ))}
        </div>

        <div className={styles.spark} ref={sparkRef}>
          <Rocket />
        </div>

        <div className={styles.baseline} />
      </div>
    </div>
  )
}