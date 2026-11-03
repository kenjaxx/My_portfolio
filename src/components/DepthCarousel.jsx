'use client'

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
// Keyboard support lives on the root (ArrowLeft / ArrowRight) and on the dot buttons,
// so the pointer handlers on the cards are an extra, not the only way in.

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import gsap from 'gsap'
import './DepthCarousel.css'

const DEFAULT_ITEMS = [
  { image: 'https://picsum.photos/seed/depth1/800/1000', alt: 'Slide 1' },
  { image: 'https://picsum.photos/seed/depth2/800/1000', alt: 'Slide 2' },
  { image: 'https://picsum.photos/seed/depth3/800/1000', alt: 'Slide 3' },
  { image: 'https://picsum.photos/seed/depth4/800/1000', alt: 'Slide 4' },
  { image: 'https://picsum.photos/seed/depth5/800/1000', alt: 'Slide 5' },
  { image: 'https://picsum.photos/seed/depth6/800/1000', alt: 'Slide 6' },
]

// 1x1 transparent GIF. Cards that are still far away from the front get this
// instead of their real image, so nothing is downloaded or decoded for them yet.
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

const clamp = (v, min, max) => Math.min(Math.max(v, min), max)
const normalizeItem = (it) => (typeof it === 'string' ? { image: it, alt: '' } : it)

/*
  Changes from the stock component:
  - No CSS `filter` (blur / brightness) on the cards. Cards are darkened with
    the overlay span's opacity instead, which the GPU can do for free.
  - No `overflow: hidden` + border-radius on the cards (see the CSS file). That
    combination makes the browser clip every 3D card through an extra surface
    on every frame. The image and the tint carry the rounded corners instead.
  - Cards that are fully hidden get `visibility: hidden` and lose their
    `will-change` layer, and they are skipped entirely while they stay hidden.
  - Images load lazily: a card only gets its real `src` once it is within
    `visibleCards + 1` places of the front, and keeps it afterwards.
  - An item can have a `fallback` image, used once if `image` fails to load.
  - The wheel listener is passive, so scrolling the page with the mouse over the
    carousel is never held up. Horizontal wheel / trackpad swipes still turn it.
  - The first layout runs before paint (useLayoutEffect), so cards never flash
    stacked on top of each other.
  - Wrapped in `memo`, so parent re-renders don't re-render the cards.
  - A ref handle: `ref.current.goTo(index)` slides the carousel to a card. The
    Certifications lightbox uses it to bring the carousel to the certificate
    you were last looking at when the lightbox closes.
*/
const DepthCarousel = forwardRef(function DepthCarousel(
  {
    items = DEFAULT_ITEMS,
    cardWidth = 300,
    cardHeight = 380,
    radius = 18,
    tint = '#05060a',
    depth = 220,
    spread = 90,
    tilt = 22,
    tiltDirection = 'right',
    perspective = 1400,
    visibleCards = 4,
    falloff = 0.2,
    duration = 700,
    ease = 'power3.out',
    autoplay = false,
    autoplayDelay = 3200,
    loop = true,
    showControls = true,
    showIndicators = true,
    onChange,
    className = '',
  },
  ref
) {
  const data = useMemo(() => (Array.isArray(items) ? items : []).map(normalizeItem), [items])
  const count = data.length

  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const cardRefs = useRef([])
  const overlayRefs = useRef([])
  const shownRef = useRef([]) // last known visible / hidden state of each card
  const loadedRef = useRef(new Set()) // cards that have been given their real image

  const posRef = useRef(0)
  const focusRef = useRef(0)
  const tweenRef = useRef(null)
  const scaleRef = useRef(1)
  const cfgRef = useRef({})
  const onChangeRef = useRef(onChange)

  const dragRef = useRef(null)
  const wheelTimerRef = useRef(null)
  const autoTimerRef = useRef(null)
  const reducedRef = useRef(false)

  const [active, setActive] = useState(0)

  // Keep the latest props in refs so the event handlers below never go stale.
  // Declared before every other effect, so the refs are current when they run.
  useLayoutEffect(() => {
    onChangeRef.current = onChange
    cfgRef.current = {
      count,
      depth,
      spread,
      tilt,
      tiltDirection,
      visibleCards,
      falloff,
      duration,
      ease,
      loop,
      cardWidth,
      autoplayDelay,
    }
  })

  const layout = useCallback((pos) => {
    const cfg = cfgRef.current
    const n = cfg.count
    if (!n) return
    const dir = cfg.tiltDirection === 'left' ? -1 : 1
    const sc = scaleRef.current
    const shownState = shownRef.current

    for (let i = 0; i < n; i++) {
      const el = cardRefs.current[i]
      if (!el) continue

      let d = i - pos
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n
        if (d > n / 2) d -= n
      }

      const az = Math.abs(d)
      const inRange = az <= cfg.visibleCards + 0.5
      const opacity = inRange ? (d < 0 ? Math.max(0, 1 + d) : 1) : 0

      // Fully hidden: switch it off once, then skip it until it comes back.
      if (opacity < 0.01) {
        if (shownState[i] !== false) {
          el.style.visibility = 'hidden'
          el.style.pointerEvents = 'none'
          el.style.willChange = 'auto'
          shownState[i] = false
        }
        continue
      }

      if (shownState[i] !== true) {
        el.style.visibility = 'visible'
        el.style.willChange = 'transform, opacity'
        shownState[i] = true
      }

      const back = Math.max(0, d)
      const tz = -cfg.depth * d
      const tx = dir * cfg.spread * d
      const ry = dir * cfg.tilt * clamp(d, 0, 1)
      const zi = Math.round(2000 - d * 20)

      el.style.transform = `translate(-50%, -50%) scale(${sc}) translate3d(${tx.toFixed(2)}px, 0, ${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`
      el.style.opacity = opacity.toFixed(3)
      el.style.zIndex = String(zi)
      el.style.pointerEvents = opacity > 0.05 ? 'auto' : 'none'

      // Darkening for cards further back: a plain overlay instead of a filter.
      const ov = overlayRefs.current[i]
      if (ov) ov.style.opacity = clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3)
    }
  }, [])

  const notify = useCallback(
    (idx) => {
      setActive(idx)
      onChangeRef.current?.(idx, data[idx])
    },
    [data]
  )

  const tweenTo = useCallback(
    (target, animate) => {
      tweenRef.current?.kill()
      const cfg = cfgRef.current
      const proxy = { p: posRef.current }
      const dur = animate && !reducedRef.current ? cfg.duration / 1000 : 0
      tweenRef.current = gsap.to(proxy, {
        p: target,
        duration: dur,
        ease: cfg.ease,
        onUpdate: () => {
          posRef.current = proxy.p
          layout(proxy.p)
        },
        onComplete: () => {
          const n = cfg.count
          if (n > 0) posRef.current = ((posRef.current % n) + n) % n
          layout(posRef.current)
        },
      })
    },
    [layout]
  )

  const setFocus = useCallback(
    (rawIndex, animate = true) => {
      const cfg = cfgRef.current
      const n = cfg.count
      if (!n) return
      const idx = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1)
      let delta = idx - posRef.current
      if (cfg.loop && n > 1) {
        delta = ((delta % n) + n) % n
        if (delta > n / 2) delta -= n
      }
      tweenTo(posRef.current + delta, animate)
      if (idx !== focusRef.current) {
        focusRef.current = idx
        notify(idx)
      }
    },
    [tweenTo, notify]
  )

  const navigateBy = useCallback((step) => setFocus(focusRef.current + step, true), [setFocus])

  // Lets a parent move the carousel: ref.current.goTo(3)
  useImperativeHandle(
    ref,
    () => ({
      goTo: (index) => setFocus(index, true),
    }),
    [setFocus]
  )

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      const cfg = cfgRef.current
      const needed = cfg.cardWidth + Math.abs(cfg.spread) * 2 + 120
      scaleRef.current = clamp(w / needed, 0.4, 1)
      layout(posRef.current)
    })
    ro.observe(root)
    return () => ro.disconnect()
  }, [layout])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    // Passive on purpose: a non-passive wheel listener makes the browser wait for
    // the main thread before it can scroll the page, which shows up as scroll lag
    // whenever the mouse is over the carousel.
    const onWheel = (e) => {
      const cfg = cfgRef.current
      if (cfg.count < 2) return
      // Only horizontal gestures (trackpad swipe, Shift + wheel) turn the carousel.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      tweenRef.current?.kill()
      const delta = e.deltaMode === 1 ? e.deltaX * 24 : e.deltaX
      const step = clamp(delta / (cfg.cardWidth * 0.9), -0.6, 0.6)
      posRef.current += step
      layout(posRef.current)
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current)
      wheelTimerRef.current = setTimeout(() => setFocus(Math.round(posRef.current), true), 130)
    }
    el.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      el.removeEventListener('wheel', onWheel)
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current)
    }
  }, [layout, setFocus])

  const onPointerDown = useCallback((e) => {
    const cfg = cfgRef.current
    if (cfg.count < 2) return
    tweenRef.current?.kill()
    dragRef.current = {
      x: e.clientX,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
      id: e.pointerId,
    }
  }, [])

  const onPointerMove = useCallback(
    (e) => {
      const drag = dragRef.current
      if (!drag) return
      const cfg = cfgRef.current
      const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40)
      const dx = e.clientX - drag.x
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true
        rootRef.current?.setPointerCapture(drag.id)
      }
      if (!drag.moved) return
      const now = performance.now()
      const dt = Math.max(now - drag.lastT, 1)
      drag.v = (e.clientX - drag.lastX) / dt
      drag.lastX = e.clientX
      drag.lastT = now
      posRef.current = drag.startPos - dx / stepPx
      layout(posRef.current)
    },
    [layout]
  )

  const onPointerEnd = useCallback(() => {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    if (!drag.moved) return
    const cfg = cfgRef.current
    const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40)
    const projected = posRef.current - (drag.v * 180) / stepPx
    setFocus(Math.round(projected), true)
  }, [setFocus])

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateBy(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateBy(1)
      }
    },
    [navigateBy]
  )

  const onCardClick = useCallback(
    (index) => {
      if (dragRef.current?.moved) return
      setFocus(index, true)
    },
    [setFocus]
  )

  useEffect(() => {
    reducedRef.current =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!autoplay || reducedRef.current || count < 2) return
    const root = rootRef.current
    let hovered = false
    let focused = false
    const stop = () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current)
      autoTimerRef.current = null
    }
    const start = () => {
      stop()
      autoTimerRef.current = window.setInterval(
        () => {
          if (!hovered && !focused) navigateBy(1)
        },
        Math.max(cfgRef.current.autoplayDelay, 600)
      )
    }
    const onEnter = () => {
      hovered = true
    }
    const onLeave = () => {
      hovered = false
    }
    const onFocusIn = () => {
      focused = true
    }
    const onFocusOut = () => {
      focused = false
    }
    root?.addEventListener('mouseenter', onEnter)
    root?.addEventListener('mouseleave', onLeave)
    root?.addEventListener('focusin', onFocusIn)
    root?.addEventListener('focusout', onFocusOut)
    start()
    return () => {
      stop()
      root?.removeEventListener('mouseenter', onEnter)
      root?.removeEventListener('mouseleave', onLeave)
      root?.removeEventListener('focusin', onFocusIn)
      root?.removeEventListener('focusout', onFocusOut)
    }
  }, [autoplay, autoplayDelay, count, navigateBy])

  // Runs before the first paint, so cards never show up stacked in one spot.
  useLayoutEffect(() => {
    layout(posRef.current)
  }, [
    layout,
    depth,
    spread,
    tilt,
    tiltDirection,
    visibleCards,
    falloff,
    cardWidth,
    cardHeight,
    radius,
    count,
  ])

  useEffect(
    () => () => {
      tweenRef.current?.kill()
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current)
      if (autoTimerRef.current) clearInterval(autoTimerRef.current)
    },
    []
  )

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${className}`.trim()}
      style={{ '--dc-perspective': `${perspective}px` }}
      role="group"
      aria-roledescription="carousel"
      aria-label="Depth carousel"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <div className="depth-carousel__stage" ref={stageRef}>
        {data.map((item, i) => {
          // Distance from the front card. Cards from one behind the front up to
          // `visibleCards + 1` ahead get their real image; the rest wait.
          let d = i - active
          if (loop && count > 1) {
            d = ((d % count) + count) % count
            if (d > count / 2) d -= count
          }
          if (d >= -1 && d <= visibleCards + 1) loadedRef.current.add(i)
          const src = loadedRef.current.has(i) ? item.image : BLANK

          return (
            <div
              key={i}
              className="depth-carousel__card"
              ref={(el) => (cardRefs.current[i] = el)}
              style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={active !== i}
              onClick={() => onCardClick(i)}
            >
              <img
                className="depth-carousel__img"
                src={src}
                alt={item.alt || ''}
                draggable={false}
                decoding="async"
                onError={(e) => {
                  // The small copy is missing: fall back to the full-size file, once.
                  const img = e.currentTarget
                  if (!item.fallback || img.dataset.fallback) return
                  img.dataset.fallback = '1'
                  img.src = item.fallback
                }}
              />
              <span
                className="depth-carousel__tint"
                ref={(el) => (overlayRefs.current[i] = el)}
                style={{ background: tint }}
              />
            </div>
          )
        })}
      </div>

      {showControls && count > 1 && (
        <>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--prev"
            aria-label="Previous slide"
            onClick={() => navigateBy(-1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--next"
            aria-label="Next slide"
            onClick={() => navigateBy(1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}

      {showIndicators && count > 1 && (
        <div className="depth-carousel__dots" role="tablist" aria-label="Slides">
          {data.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Go to slide ${i + 1}`}
              className={`depth-carousel__dot${active === i ? ' is-active' : ''}`}
              onClick={() => setFocus(i, true)}
            />
          ))}
        </div>
      )}
    </div>
  )
})

export default memo(DepthCarousel)