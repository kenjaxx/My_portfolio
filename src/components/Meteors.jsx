import { useEffect, useRef, useState } from 'react'
import styles from './Meteors.module.css'

/*
  Meteor shower background, ported from Magic UI to plain React + CSS Modules
  (your project doesn't use Tailwind or TypeScript, so this needs neither).

  Drop it inside any `position: relative` section and it fills that section
  behind the content.
*/
export default function Meteors({
  number = 18, // how many meteors
  minDelay = 0.2, // seconds before a meteor first appears (min)
  maxDelay = 6, // seconds before a meteor first appears (max)
  minDuration = 3, // seconds one meteor takes to fall (min). Lower = faster
  maxDuration = 8, // seconds one meteor takes to fall (max)
  angle = 65, // 0 = sideways, 90 = straight down. Meteors fall toward the bottom-left
  distance = 700, // how far (px) a meteor travels before fading out
  colors = ['var(--cyan)', 'var(--purple)'], // each meteor picks one at random
  className = '',
}) {
  const wrapRef = useRef(null)
  const [meteors, setMeteors] = useState([])

  useEffect(() => {
    // Visitors who prefer reduced motion get no meteors at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMeteors([])
      return
    }

    const width = wrapRef.current?.offsetWidth ?? window.innerWidth
    // Meteors drift left as they fall, so spawn some past the right edge
    // too; otherwise the top-right corner would stay empty.
    const reach = distance * Math.cos((angle * Math.PI) / 180)

    setMeteors(
      Array.from({ length: number }, () => ({
        '--angle': `${angle}deg`,
        '--distance': `${distance}px`,
        '--meteor-color': colors[Math.floor(Math.random() * colors.length)],
        top: '-5%',
        left: `${Math.random() * (width + reach)}px`,
        animationDelay: `${Math.random() * (maxDelay - minDelay) + minDelay}s`,
        animationDuration: `${Math.random() * (maxDuration - minDuration) + minDuration}s`,
      }))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle, distance])

  return (
    <div ref={wrapRef} className={`${styles.wrap} ${className}`} aria-hidden="true">
      {meteors.map((style, i) => (
        <span key={i} className={styles.meteor} style={style} />
      ))}
    </div>
  )
}